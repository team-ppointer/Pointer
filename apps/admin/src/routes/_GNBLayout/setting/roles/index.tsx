import { FormEvent, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { $api, deleteRole, getMenus, getRoles, postRole, putRole } from '@apis';
import { Button, Input } from '@components';
import { components } from '@schema';
import { CheckSquare, Pencil, Plus, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/setting/roles/')({
  component: RouteComponent,
});

type AdminRoleResp = components['schemas']['AdminRoleResp'];
type AdminMenuResp = components['schemas']['AdminMenuResp'];

type RoleFormState = {
  name: string;
  menuIds: number[];
};

type MenuGroup = {
  parent: AdminMenuResp;
  children: AdminMenuResp[];
};

const initialRoleFormState: RoleFormState = {
  name: '',
  menuIds: [],
};

const getMenuLabel = (name?: string) => {
  const labels: Record<string, string> = {
    STUDENT: '학생 관리',
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
  };

  return name ? (labels[name] ?? name) : '이름 없음';
};

const toggleMenuId = (menuIds: number[], menuId: number) => {
  return menuIds.includes(menuId) ? menuIds.filter((id) => id !== menuId) : [...menuIds, menuId];
};

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: roles = [] } = getRoles();
  const { data: menus = [] } = getMenus();
  const { mutate: createRole, isPending: isCreating } = postRole();
  const { mutate: updateRole, isPending: isUpdating } = putRole();
  const { mutate: removeRole, isPending: isDeleting } = deleteRole();
  const [createForm, setCreateForm] = useState<RoleFormState>(initialRoleFormState);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RoleFormState>(initialRoleFormState);
  const roleQueryKey = useMemo(() => $api.queryOptions('get', '/api/admin/role').queryKey, []);
  const menuGroups = useMemo<MenuGroup[]>(() => {
    const parentMenus = menus.filter((menu) => typeof menu.id === 'number' && menu.parentId == null);
    const parentMenuIds = new Set(parentMenus.map((menu) => menu.id));
    const orphanMenus = menus.filter(
      (menu) => typeof menu.id === 'number' && menu.parentId != null && !parentMenuIds.has(menu.parentId)
    );

    return [...parentMenus, ...orphanMenus].map((parent) => ({
      parent,
      children: menus.filter(
        (menu) => typeof menu.id === 'number' && menu.parentId === parent.id && menu.id !== parent.id
      ),
    }));
  }, [menus]);

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: roleQueryKey });
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
        onSuccess: () => {
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
        onSuccess: invalidateRoles,
      }
    );
  };

  const renderMenuOption = (
    menu: AdminMenuResp,
    form: RoleFormState,
    onChange: (menuIds: number[]) => void,
    className?: string
  ) => {
    if (typeof menu.id !== 'number') return null;

    const isChecked = form.menuIds.includes(menu.id);

    return (
      <label
        key={menu.id}
        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
          isChecked
            ? 'border-main/30 bg-main/10 text-main'
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        } ${className ?? ''}`}>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={() => onChange(toggleMenuId(form.menuIds, menu.id))}
          className='accent-main h-4 w-4'
        />
        <span>{getMenuLabel(menu.name)}</span>
        <span className='ml-auto text-xs font-medium text-gray-400'>{menu.name}</span>
      </label>
    );
  };

  const renderMenuCheckboxes = (form: RoleFormState, onChange: (menuIds: number[]) => void) => (
    <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
      {menuGroups.map(({ parent, children }) => (
        <div
          key={parent.id}
          className='rounded-2xl border border-gray-100 bg-gray-50/60 p-3'>
          {renderMenuOption(parent, form, onChange, 'bg-white')}
          {children.length > 0 && (
            <div className='mt-2 grid grid-cols-1 gap-2 pl-3'>
              {children.map((child) =>
                renderMenuOption(child, form, onChange, 'border-dashed bg-white/80')
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className='flex min-h-screen flex-col gap-6 p-8'>
      <header>
        <h1 className='text-2xl font-bold text-gray-900'>역할 관리</h1>
        <p className='mt-2 text-sm text-gray-500'>역할별 접근 메뉴를 체크박스로 관리합니다.</p>
      </header>

      <form
        onSubmit={handleCreateSubmit}
        className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row'>
          <Input
            placeholder='역할 이름'
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
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

              {renderMenuCheckboxes(form, (menuIds) => {
                if (isEditing) {
                  setEditForm((prev) => ({ ...prev, menuIds }));
                }
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
