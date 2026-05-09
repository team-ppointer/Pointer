import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { $api, deleteRole, getMenus, getRoles, postRole, putRole } from '@apis';
import { Button, Header, Input } from '@components';
import { components } from '@schema';
import { adminSessionStorage, reissueToken } from '@utils';
import { CheckSquare, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';

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

const getMenuLabel = (name?: string) => {
  const labels: Record<string, string> = {
    PUBLISH: '발행',
    NOTICE: '공지',
    NOTIFICATION: '알림',
    DIAGNOSIS: '학생 진단',
    GRAPH: '그래프 관리',
    QNA: 'Q&A',
    PROBLEM: '문제 관리',
    PROBLEM_ITEM: '문제',
    PROBLEM_SET: '세트',
    CONCEPT_TAG: '개념 태그',
    TEACHER: '선생님 관리',
    SETTING: '설정',
    ADMIN_ACCOUNT: '관리자 계정',
    ADMIN_ROLE: '역할 관리',
    ADMIN_MENU: '메뉴 관리',
  };

  return name ? (labels[name] ?? name) : '이름 없음';
};

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: roleListResponse } = getRoles();
  const { data: menuListResponse } = getMenus();
  const { mutate: createRole, isPending: isCreating } = postRole();
  const { mutate: updateRole, isPending: isUpdating } = putRole();
  const { mutate: removeRole, isPending: isDeleting } = deleteRole();
  const [createForm, setCreateForm] = useState<RoleFormState>(initialRoleFormState);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RoleFormState>(initialRoleFormState);
  const roleQueryKey = useMemo(() => $api.queryOptions('get', '/api/admin/role').queryKey, []);
  const roles = roleListResponse?.data ?? [];
  const menus = menuListResponse?.data ?? [];
  const menuMap = useMemo(() => {
    return new Map(
      menus
        .filter((menu): menu is AdminMenuResp & { id: number } => typeof menu.id === 'number')
        .map((menu) => [menu.id, menu])
    );
  }, [menus]);
  const childrenMap = useMemo(() => {
    const map = new Map<number | null, AdminMenuResp[]>();

    menus.forEach((menu) => {
      const id = typeof menu.id === 'number' ? menu.id : null;
      if (id === null) return;

      const rawParentId = typeof menu.parentId === 'number' ? menu.parentId : null;
      const parentId = rawParentId !== null && menuMap.has(rawParentId) ? rawParentId : null;
      const bucket = map.get(parentId) ?? [];
      bucket.push(menu);
      map.set(parentId, bucket);
    });

    for (const bucket of map.values()) {
      bucket.sort((a, b) => {
        const labelCompare = getMenuLabel(a.name).localeCompare(getMenuLabel(b.name), 'ko');
        if (labelCompare !== 0) return labelCompare;

        return (a.id ?? 0) - (b.id ?? 0);
      });
    }

    return map;
  }, [menus]);
  const rootMenus = childrenMap.get(null) ?? [];

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: roleQueryKey });
  };

  const getDescendantIds = (menuId: number) => {
    const descendants: number[] = [];
    const stack = [...(childrenMap.get(menuId) ?? [])];

    while (stack.length > 0) {
      const current = stack.pop();
      const currentId = current?.id;

      if (typeof currentId !== 'number') continue;

      descendants.push(currentId);
      stack.push(...(childrenMap.get(currentId) ?? []));
    }

    return descendants;
  };

  const getAncestorIds = (menuId: number) => {
    const ancestors: number[] = [];
    let currentParentId = menuMap.get(menuId)?.parentId;

    while (typeof currentParentId === 'number') {
      ancestors.push(currentParentId);
      currentParentId = menuMap.get(currentParentId)?.parentId;
    }

    return ancestors;
  };

  const getEffectiveMenuIds = (menuIds: number[]) => {
    return Array.from(new Set(menuIds.flatMap((id) => [id, ...getAncestorIds(id)])));
  };

  const pruneAncestorIds = (menuIds: number[]) => {
    const selectedMenuIds = new Set(menuIds);
    const sortedMenuIds = [...selectedMenuIds].sort(
      (left, right) => getAncestorIds(right).length - getAncestorIds(left).length
    );

    sortedMenuIds.forEach((currentMenuId) => {
      const childIds = (childrenMap.get(currentMenuId) ?? [])
        .map((child) => child.id)
        .filter((id): id is number => typeof id === 'number');

      if (childIds.length === 0) return;

      const hasSelectedChild = childIds.some((childId) => selectedMenuIds.has(childId));
      if (!hasSelectedChild) {
        selectedMenuIds.delete(currentMenuId);
      }
    });

    return Array.from(selectedMenuIds);
  };

  const toggleMenuIds = (menuIds: number[], menuId: number) => {
    const selectedMenuIds = new Set(menuIds);
    const isChecked = selectedMenuIds.has(menuId);

    if (isChecked) {
      const descendantIds = getDescendantIds(menuId);
      const nextMenuIds = menuIds.filter((id) => id !== menuId && !descendantIds.includes(id));

      return pruneAncestorIds(nextMenuIds);
    }

    return getEffectiveMenuIds([...menuIds, menuId]);
  };

  const handleCreateSubmit = (event: FormEvent) => {
    event.preventDefault();

    createRole(
      {
        body: createForm,
      },
      {
        onSuccess: () => {
          setCreateForm(initialRoleFormState);
          invalidateRoles();
        },
      }
    );
  };

  const handleEditStart = (role: AdminRoleResp) => {
    setEditingRoleId(role.id ?? null);
    setEditForm({
      name: role.name ?? '',
      menuIds:
        role.menus?.map((menu) => menu.id).filter((id): id is number => typeof id === 'number') ??
        [],
    });
  };

  const refreshSessionIfOwnRole = async (roleId: number) => {
    // 본인이 바인딩된 role의 권한이 바뀌면 accessibleMenus가 stale 상태로 남음
    if (roleId === adminSessionStorage.getSession()?.roleId) {
      await reissueToken({ silentLogoutOnFail: false });
    }
  };

  const submitEditRole = () => {
    if (!editingRoleId) return;

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
      }
    );
  };

  const handleDelete = (id?: number) => {
    if (!id || !window.confirm('역할을 삭제할까요?')) return;

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
      }
    );
  };

  const renderMenuOption = (
    menu: AdminMenuResp,
    form: RoleFormState,
    onChange: (menuIds: number[]) => void
  ) => {
    if (typeof menu.id !== 'number') return null;

    const isChecked = form.menuIds.includes(menu.id);
    const parentMenu = typeof menu.parentId === 'number' ? menuMap.get(menu.parentId) : undefined;
    const parentName = parentMenu ? getMenuLabel(parentMenu.name) : '최상위';

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
          onChange={() => onChange(toggleMenuIds(form.menuIds, menu.id))}
          className='accent-main h-4 w-4'
        />
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <FolderTree className='text-main h-4 w-4 flex-shrink-0' />
            <span className='truncate'>{getMenuLabel(menu.name)}</span>
          </div>
          <p className='mt-1 text-xs font-medium text-gray-400'>
            {menu.name} · 부모 메뉴 {parentName}
          </p>
        </div>
      </label>
    );
  };

  const renderMenuTree = (
    menu: AdminMenuResp,
    form: RoleFormState,
    onChange: (menuIds: number[]) => void,
    depth = 0
  ): ReactNode => {
    const id = typeof menu.id === 'number' ? menu.id : null;
    if (id === null) return null;

    const children = childrenMap.get(id) ?? [];

    return (
      <div key={id} className={`${depth > 0 ? 'ml-6 border-l border-gray-100 pl-4' : ''}`}>
        {renderMenuOption(menu, form, onChange)}
        {children.length > 0 && (
          <div className='mt-3 flex flex-col gap-3'>
            {children.map((child) => renderMenuTree(child, form, onChange, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderMenuCheckboxes = (form: RoleFormState, onChange: (menuIds: number[]) => void) => (
    <div className='flex flex-col gap-3'>
      {rootMenus.map((menu) => renderMenuTree(menu, form, onChange))}
    </div>
  );

  const renderSelectedMenuTree = (
    menu: AdminMenuResp,
    selectedMenuIds: number[],
    depth = 0
  ): ReactNode => {
    const id = typeof menu.id === 'number' ? menu.id : null;
    if (id === null) return null;

    const isSelected = selectedMenuIds.includes(id);

    const childDepth = isSelected ? depth + 1 : depth;
    const children = (childrenMap.get(id) ?? [])
      .map((child) => renderSelectedMenuTree(child, selectedMenuIds, childDepth))
      .filter(Boolean);

    if (!isSelected && children.length === 0) {
      return null;
    }

    if (!isSelected) {
      return (
        <div key={id} className='flex flex-col gap-3'>
          {children}
        </div>
      );
    }

    return (
      <div key={id} className={`${depth > 0 ? 'ml-6 border-l border-gray-100 pl-4' : ''}`}>
        <div className='rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <FolderTree className='text-main h-4 w-4 flex-shrink-0' />
            <span className='text-sm font-semibold text-gray-800'>{getMenuLabel(menu.name)}</span>
          </div>
          <p className='mt-1 text-xs font-medium text-gray-400'>{menu.name}</p>
        </div>
        {children.length > 0 && <div className='mt-3 flex flex-col gap-3'>{children}</div>}
      </div>
    );
  };

  const renderSelectedMenus = (selectedMenuIds: number[]) => {
    const selectedTrees = rootMenus
      .map((menu) => renderSelectedMenuTree(menu, selectedMenuIds))
      .filter(Boolean);

    if (selectedTrees.length === 0) {
      return (
        <div className='rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-600'>
          선택된 메뉴가 없습니다.
        </div>
      );
    }

    return <div className='flex flex-col gap-3'>{selectedTrees}</div>;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='역할 관리'>
        <></>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6'>
          <h2 className='text-xl font-bold text-gray-900'>역할 생성</h2>
          <p className='mt-2 text-sm text-gray-500'>역할별 접근 메뉴를 체크박스로 관리합니다.</p>

          <form onSubmit={handleCreateSubmit} className='mt-6 flex flex-col gap-4'>
            <div className='flex flex-col gap-3 lg:flex-row'>
              <Input
                placeholder='역할 이름'
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
              <Button type='submit' disabled={isCreating}>
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
                  menuIds:
                    role.menus
                      ?.map((menu) => menu.id)
                      .filter((id): id is number => typeof id === 'number') ?? [],
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
