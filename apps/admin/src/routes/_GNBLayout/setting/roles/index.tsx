import { FormEvent, useMemo, useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { $api, deleteRole, getMenus, getRoles, postRole, putRole } from '@apis';
import { Button, Header, Input } from '@components';
import { components } from '@schema';
import { adminSessionStorage, refreshSession } from '@utils';
import { AlertCircle, CheckSquare, Pencil, Plus, Trash2 } from 'lucide-react';

import { ADMIN_NAV_SECTIONS, AdminNavItem } from '@/constants/adminPermissions';

export const Route = createFileRoute('/_GNBLayout/setting/roles/')({
  component: RouteComponent,
});

type AdminRoleResp = components['schemas']['AdminRoleResp'];
type AdminMenuResp = components['schemas']['AdminMenuResp'];

type RoleFormState = {
  name: string;
  menuIds: number[];
};

const initialRoleFormState: RoleFormState = {
  name: '',
  menuIds: [],
};

const getRoleMutationErrorMessage = (error: unknown): string => {
  const fallback = '요청 처리 중 오류가 발생했습니다.';
  if (!error || typeof error !== 'object') return fallback;
  const typed = error as {
    message?: string;
    error?: { message?: string };
    data?: { message?: string };
  };
  return typed.message ?? typed.error?.message ?? typed.data?.message ?? fallback;
};

type RenderableMenu = Pick<AdminNavItem, 'menuName' | 'label' | 'icon'> & { id: number };

type MenuSection = {
  title: string;
  menus: RenderableMenu[];
};

const toggleMenuId = (menuIds: number[], menuId: number) => {
  const selectedIds = new Set(menuIds);
  if (selectedIds.has(menuId)) {
    selectedIds.delete(menuId);
  } else {
    selectedIds.add(menuId);
  }
  return Array.from(selectedIds);
};

// FE 의 ADMIN_NAV_SECTIONS 정의(권한의 source of truth)를 forward 로 순회하면서
// 백엔드 메뉴 응답에 같은 name 이 있는 경우만 렌더한다. 백엔드에만 존재하는 row 는
// FE 가 모르는 권한이라 grant UI 에 노출하지 않는다.
const buildMenuSections = (menus: AdminMenuResp[]): MenuSection[] => {
  const menuIdByName = new Map<string, number>();
  for (const menu of menus) {
    if (typeof menu.id === 'number' && menu.name) {
      menuIdByName.set(menu.name, menu.id);
    }
  }

  // dev 모드에서 FE/BE menu seed 동기화 누락을 조기 발견할 수 있도록
  // FE 가 모르는 backend 메뉴 이름을 알린다.
  if (import.meta.env.DEV) {
    const knownNames = new Set(
      ADMIN_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.menuName as string))
    );
    const unknown = [...menuIdByName.keys()].filter((name) => !knownNames.has(name));
    if (unknown.length > 0) {
      console.warn('[role-form] backend menu not in ADMIN_NAV_SECTIONS:', unknown);
    }
  }

  return ADMIN_NAV_SECTIONS.map((section) => ({
    title: section.title,
    menus: section.items.flatMap((item) => {
      const id = menuIdByName.get(item.menuName);
      if (id === undefined) return [];
      return [{ id, menuName: item.menuName, label: item.label, icon: item.icon }];
    }),
  })).filter((section) => section.menus.length > 0);
};

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: roleListResponse } = getRoles();
  const { data: menuListResponse, isLoading: isLoadingMenus, isError: isMenusError } = getMenus();
  const { mutate: createRole, isPending: isCreating } = postRole();
  const { mutate: updateRole, isPending: isUpdating } = putRole();
  const { mutate: removeRole, isPending: isDeleting } = deleteRole();
  const [createForm, setCreateForm] = useState<RoleFormState>(initialRoleFormState);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RoleFormState>(initialRoleFormState);
  const [mutationError, setMutationError] = useState('');
  const roleQueryKey = useMemo(() => $api.queryOptions('get', '/api/admin/role').queryKey, []);
  const roles = roleListResponse?.data ?? [];
  const menus = menuListResponse?.data ?? [];
  const menuSections = useMemo(() => buildMenuSections(menus), [menus]);
  const visibleMenuIds = useMemo(
    () => new Set(menuSections.flatMap((section) => section.menus.map((menu) => menu.id))),
    [menuSections]
  );
  // visibleMenuIds 가 비어 있는 동안 toVisibleMenuIds 를 호출하면 기존 권한이 모두
  // 제거된 것처럼 보이므로, menu 응답이 도착하기 전에는 편집/생성 자체를 막는다.
  const menusReady = !isLoadingMenus && !isMenusError;

  // role 응답의 menu id 들 중 폼에서 토글 가능한(=visible) 것만 추린다.
  // 백엔드에 남아 있지만 FE 가 모르는 권한이 submit 시 silent 하게 보존되는 회귀 차단.
  const toVisibleMenuIds = (role: AdminRoleResp): number[] => {
    const allIds =
      role.menus?.map((menu) => menu.id).filter((id): id is number => typeof id === 'number') ?? [];
    const visible = allIds.filter((id) => visibleMenuIds.has(id));

    if (import.meta.env.DEV && visible.length !== allIds.length) {
      const dropped = allIds.filter((id) => !visibleMenuIds.has(id));
      console.warn(
        '[role-form] dropping role menu ids not visible in form:',
        dropped,
        'role:',
        role.name
      );
    }

    return visible;
  };

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: roleQueryKey });
  };

  const handleCreateSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!menusReady) return;
    setMutationError('');

    createRole(
      {
        body: createForm,
      },
      {
        onSuccess: () => {
          setCreateForm(initialRoleFormState);
          invalidateRoles();
        },
        onError: (error) => {
          setMutationError(getRoleMutationErrorMessage(error));
        },
      }
    );
  };

  const handleEditStart = (role: AdminRoleResp) => {
    if (!menusReady) return;
    setEditingRoleId(role.id ?? null);
    setEditForm({
      name: role.name ?? '',
      menuIds: toVisibleMenuIds(role),
    });
  };

  const refreshSessionIfOwnRole = async (roleId: number) => {
    // 본인이 바인딩된 role의 권한이 바뀌면 accessibleMenus 갱신 + 현재 경로 권한 재평가
    if (roleId === adminSessionStorage.getSession()?.roleId) {
      await refreshSession();
      await router.invalidate();
    }
  };

  const submitEditRole = () => {
    if (!editingRoleId) return;
    setMutationError('');

    updateRole(
      {
        params: {
          path: {
            id: editingRoleId,
          },
        },
        body: editForm,
      },
      {
        onSuccess: async () => {
          await refreshSessionIfOwnRole(editingRoleId);
          setEditingRoleId(null);
          setEditForm(initialRoleFormState);
          invalidateRoles();
        },
        onError: (error) => {
          setMutationError(getRoleMutationErrorMessage(error));
        },
      }
    );
  };

  const handleDelete = (id?: number) => {
    if (!id || !window.confirm('역할을 삭제할까요?')) return;
    setMutationError('');

    removeRole(
      {
        params: {
          path: {
            id,
          },
        },
      },
      {
        onSuccess: async () => {
          await refreshSessionIfOwnRole(id);
          invalidateRoles();
        },
        onError: (error) => {
          setMutationError(getRoleMutationErrorMessage(error));
        },
      }
    );
  };

  const renderMenuCheckboxes = (form: RoleFormState, onChange: (menuIds: number[]) => void) => (
    <div className='flex flex-col gap-5'>
      {menuSections.map((section) => (
        <div key={section.title} className='flex flex-col gap-2'>
          <div className='text-xs font-bold tracking-widest text-gray-500 uppercase'>
            {section.title}
          </div>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {section.menus.map((menu) => {
              const isChecked = form.menuIds.includes(menu.id);
              const Icon = menu.icon;

              return (
                <label
                  key={menu.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isChecked
                      ? 'border-main/30 bg-main/10 text-main'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <input
                    type='checkbox'
                    checked={isChecked}
                    onChange={() => onChange(toggleMenuId(form.menuIds, menu.id))}
                    className='accent-main h-4 w-4'
                  />
                  <div className='flex min-w-0 flex-1 items-center gap-2'>
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${isChecked ? 'text-main' : 'text-gray-500'}`}
                    />
                    <span className='truncate'>{menu.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSelectedMenus = (selectedMenuIds: number[]) => {
    const selectedSet = new Set(selectedMenuIds);
    const visibleSections = menuSections
      .map((section) => ({
        ...section,
        menus: section.menus.filter((menu) => selectedSet.has(menu.id)),
      }))
      .filter((section) => section.menus.length > 0);

    if (visibleSections.length === 0) {
      return (
        <div className='rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-600'>
          선택된 메뉴가 없습니다.
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-4'>
        {visibleSections.map((section) => (
          <div key={section.title} className='flex flex-col gap-2'>
            <div className='text-xs font-bold tracking-widest text-gray-500 uppercase'>
              {section.title}
            </div>
            <div className='flex flex-wrap gap-2'>
              {section.menus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <span
                    key={menu.id}
                    className='border-main/20 bg-main/5 text-main inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold'>
                    <Icon className='h-3.5 w-3.5' />
                    {menu.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='역할 관리'>
        <></>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {mutationError && (
          <div className='mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <span className='flex-1'>{mutationError}</span>
            <button
              type='button'
              onClick={() => setMutationError('')}
              className='text-xs font-semibold text-red-600 underline-offset-2 hover:underline'>
              닫기
            </button>
          </div>
        )}

        {!menusReady && (
          <div className='mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <span className='flex-1'>
              {isMenusError
                ? '메뉴 목록을 불러오지 못해 역할을 편집할 수 없습니다. 새로고침 후 다시 시도해주세요.'
                : '메뉴 목록을 불러오는 중입니다.'}
            </span>
          </div>
        )}

        <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6'>
          <h2 className='text-xl font-bold text-gray-900'>역할 생성</h2>
          <p className='mt-2 text-sm text-gray-500'>역할별 접근 메뉴를 체크박스로 관리합니다.</p>

          <form onSubmit={handleCreateSubmit} className='mt-6 flex flex-col gap-6'>
            <div className='flex flex-col gap-3 lg:flex-row'>
              <Input
                placeholder='역할 이름'
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
              <Button type='submit' disabled={isCreating || !menusReady}>
                <Plus className='h-4 w-4' />
                역할 생성
              </Button>
            </div>
            {renderMenuCheckboxes(createForm, (menuIds) =>
              setCreateForm((prev) => ({ ...prev, menuIds }))
            )}
          </form>
        </div>

        <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
          {roles.map((role) => {
            const isEditing = editingRoleId === role.id;
            const form = isEditing
              ? editForm
              : {
                  name: role.name ?? '',
                  menuIds: toVisibleMenuIds(role),
                };

            return (
              <section
                key={role.id}
                className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <CheckSquare className='text-main h-5 w-5 flex-shrink-0' />
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        required
                      />
                    ) : (
                      <div className='min-w-0'>
                        <h2 className='truncate text-lg font-bold text-gray-900'>{role.name}</h2>
                        <p className='mt-1 text-xs font-medium text-gray-500'>
                          {form.menuIds.length}개 메뉴
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    {isEditing ? (
                      <>
                        <Button
                          type='button'
                          sizeType='sm'
                          disabled={isUpdating}
                          onClick={submitEditRole}>
                          저장
                        </Button>
                        <Button
                          type='button'
                          sizeType='sm'
                          variant='light'
                          onClick={() => setEditingRoleId(null)}>
                          취소
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type='button'
                          sizeType='sm'
                          variant='light'
                          disabled={!menusReady}
                          onClick={() => handleEditStart(role)}>
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          type='button'
                          sizeType='sm'
                          variant='danger'
                          disabled={isDeleting}
                          onClick={() => handleDelete(role.id)}>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing
                  ? renderMenuCheckboxes(form, (menuIds) => {
                      setEditForm((prev) => ({ ...prev, menuIds }));
                    })
                  : renderSelectedMenus(form.menuIds)}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
