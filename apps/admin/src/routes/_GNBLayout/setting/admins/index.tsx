import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Header, Input, Modal, OneButtonModalTemplate } from '@components';
import {
  $api,
  deleteUser,
  getRoles,
  getUserById,
  getUserList,
  postUser,
  putUser,
  putUserRole,
} from '@apis';
import { useModal } from '@hooks';
import { components } from '@schema';
import { adminSessionStorage, refreshSession } from '@utils';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCircle,
} from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/setting/admins/')({
  component: RouteComponent,
});

type AdminResp = components['schemas']['AdminResp'];
type AdminListResp = components['schemas']['ListRespAdminResp'];

interface UserFormValues {
  name: string;
  email: string;
  password: string;
}

interface ApiErrorShape {
  message?: string;
  code?: string;
  error?: {
    message?: string;
    code?: string;
  };
  data?: {
    message?: string;
    code?: string;
  };
}

const getErrorMeta = (error: unknown) => {
  const fallback = {
    code: '',
    message: '요청 처리 중 오류가 발생했습니다.',
  };

  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const typedError = error as ApiErrorShape;

  return {
    code: typedError.code ?? typedError.error?.code ?? typedError.data?.code ?? '',
    message:
      typedError.message ??
      typedError.error?.message ??
      typedError.data?.message ??
      fallback.message,
  };
};

const getCreateOrUpdateErrorMessage = (error: unknown) => {
  const { code, message } = getErrorMeta(error);

  if (code === 'DUPLICATED_EMAIL') {
    return '이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.';
  }

  return message;
};

const getDeleteErrorMessage = (error: unknown) => {
  const { code, message } = getErrorMeta(error);

  if (code === 'ADMIN_002') {
    return '본인 계정은 삭제할 수 없습니다.';
  }

  return message;
};

const getAdminTypeLabel = (adminType: AdminResp['adminType']) => {
  if (adminType === 'SUPER') {
    return '슈퍼 관리자';
  }

  return '역할 기반';
};

const UserFormModal = ({
  mode,
  userId,
  initialUser,
  isLoading,
  loadErrorMessage,
  isOpen,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  userId: number | null;
  initialUser: AdminResp | null;
  isLoading: boolean;
  loadErrorMessage: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isEditMode = mode === 'edit' && userId !== null;
  const { mutate: createUser, isPending: isCreatePending } = postUser();
  const { mutate: updateUser, isPending: isUpdatePending } = putUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        name: '',
        email: '',
        password: '',
      });
      setSubmitError('');
      setShowPassword(false);
      return;
    }

    if (isEditMode && initialUser) {
      reset({
        name: initialUser.name,
        email: initialUser.email,
        password: '',
      });
      setSubmitError('');
      return;
    }

    if (mode === 'create') {
      reset({
        name: '',
        email: '',
        password: '',
      });
      setSubmitError('');
    }
  }, [initialUser, isEditMode, isOpen, mode, reset]);

  const isPending = isCreatePending || isUpdatePending;

  const onSubmit = handleSubmit((values) => {
    setSubmitError('');

    if (mode === 'create') {
      createUser(
        {
          body: {
            name: values.name,
            email: values.email.trim(),
            password: values.password,
          },
        },
        {
          onSuccess: () => {
            onSuccess('관리자 계정 등록이 완료되었습니다.');
            onClose();
          },
          onError: (error) => {
            setSubmitError(getCreateOrUpdateErrorMessage(error));
          },
        }
      );
      return;
    }

    if (!userId) {
      return;
    }

    const body: components['schemas']['AdminUpdateRequest'] = {
      name: values.name.trim() || undefined,
      email: values.email.trim(),
    };

    if (values.password.trim()) {
      body.password = values.password;
    }

    updateUser(
      {
        params: {
          path: {
            id: userId,
          },
        },
        body,
      },
      {
        onSuccess: async () => {
          // 본인 계정 수정 시 로컬 세션의 name/email이 stale 상태로 남지 않도록 재발급하고
          // 현재 경로의 권한도 다시 평가한다.
          if (userId === adminSessionStorage.getSession()?.id) {
            await refreshSession();
            await router.invalidate();
          }
          onSuccess('관리자 계정 수정이 완료되었습니다.');
          onClose();
        },
        onError: (error) => {
          setSubmitError(getCreateOrUpdateErrorMessage(error));
        },
      }
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-[560px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-8'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            {mode === 'create' ? (
              <Plus className='h-5 w-5 text-white' />
            ) : (
              <Pencil className='h-5 w-5 text-white' />
            )}
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              {mode === 'create' ? '관리자 등록' : '관리자 수정'}
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              {mode === 'create'
                ? '이메일과 비밀번호를 입력해 관리자 계정을 생성합니다.'
                : '관리자 계정 정보를 수정합니다.'}
            </p>
          </div>
        </div>

        {isEditMode && isLoading ? (
          <div className='flex h-48 items-center justify-center text-sm font-medium text-gray-500'>
            관리자 정보를 불러오는 중입니다.
          </div>
        ) : loadErrorMessage ? (
          <div className='flex h-48 items-center justify-center px-6 text-center text-sm font-medium text-red-500'>
            {loadErrorMessage}
          </div>
        ) : (
          <form onSubmit={onSubmit} className='space-y-5'>
            {submitError && (
              <div className='flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>
                <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <UserCircle className='h-4 w-4 text-gray-500' />
                이름
              </label>
              <Input
                type='text'
                placeholder='관리자 이름을 입력해주세요'
                {...register('name', {
                  required: '이름을 입력해주세요.',
                })}
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.name && (
                <p className='mt-2 text-sm font-medium text-red-500'>{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <Mail className='h-4 w-4 text-gray-500' />
                이메일
              </label>
              <Input
                type='email'
                placeholder='example@pointer.com'
                autoComplete='username'
                {...register('email', {
                  required: '이메일을 입력해주세요.',
                })}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.email && (
                <p className='mt-2 text-sm font-medium text-red-500'>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <ShieldCheck className='h-4 w-4 text-gray-500' />
                비밀번호
              </label>
              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    mode === 'create'
                      ? '비밀번호를 입력해주세요'
                      : '변경할 때만 비밀번호를 입력해주세요'
                  }
                  autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                  {...register('password', {
                    required: mode === 'create' ? '비밀번호를 입력해주세요.' : false,
                  })}
                  className={errors.password ? 'border-red-500 focus:border-red-500' : 'pr-11'}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'>
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {mode === 'edit' && (
                <p className='mt-2 text-xs font-medium text-gray-500'>
                  비밀번호를 비워두면 기존 비밀번호를 유지합니다.
                </p>
              )}
              {errors.password && (
                <p className='mt-2 text-sm font-medium text-red-500'>{errors.password.message}</p>
              )}
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                취소
              </button>
              <button
                type='submit'
                disabled={isPending}
                className='bg-main hover:bg-main/90 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
                {mode === 'create' ? '등록' : '저장'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

const AdminUserModal = ({
  mode,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) => {
  if (mode === 'edit' && userId !== null) {
    return (
      <EditAdminUserModal userId={userId} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
    );
  }

  return (
    <UserFormModal
      mode='create'
      userId={null}
      initialUser={null}
      isLoading={false}
      loadErrorMessage=''
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

const EditAdminUserModal = ({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) => {
  const { data, isLoading, error } = getUserById(userId);

  return (
    <UserFormModal
      mode='edit'
      userId={userId}
      initialUser={data ?? null}
      isLoading={isLoading}
      loadErrorMessage={error ? '관리자 정보를 불러오지 못했습니다.' : ''}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

const DeleteUserModal = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  errorMessage,
}: {
  user: AdminResp | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage: string;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-[460px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-8'>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600'>
            <Trash2 className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>관리자 삭제</h2>
            <p className='mt-1 text-sm text-gray-500'>삭제 후에는 계정을 복구할 수 없습니다.</p>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700'>
          <p className='font-semibold text-gray-900'>{user?.name}</p>
          <p className='mt-1 text-xs text-gray-500'>{user?.email}</p>
          <p className='mt-1'>이 관리자 계정을 삭제하시겠습니까?</p>
        </div>

        {errorMessage && (
          <div className='mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className='mt-6 flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
            취소
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isPending}
            className='rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60'>
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
};

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminResp | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [roleChangeError, setRoleChangeError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {
    isOpen: isUserModalOpen,
    openModal: openUserModal,
    closeModal: closeUserModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();
  const { data: userListResponse, isLoading } = getUserList();
  const { data: roleListResponse } = getRoles();
  const { mutate: removeUser, isPending: isDeletePending } = deleteUser();
  const { mutate: assignRole } = putUserRole();
  const [pendingUserIds, setPendingUserIds] = useState<Set<number>>(new Set());

  const userList = userListResponse?.data ?? [];
  const roleList = roleListResponse?.data ?? [];
  const userListQueryKey = useMemo(() => $api.queryOptions('get', '/api/admin/user').queryKey, []);

  const refreshUserList = () => {
    queryClient.invalidateQueries({
      queryKey: userListQueryKey,
    });
  };

  const handleChangeRole = (userId: number, value: string) => {
    if (pendingUserIds.has(userId)) return;

    const isSuper = value === 'SUPER';
    const newRoleId = isSuper ? null : Number(value);
    const nextRole = isSuper ? null : (roleList.find((role) => role.id === newRoleId) ?? null);

    queryClient.setQueryData<AdminListResp | undefined>(userListQueryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((user) =>
          user.id === userId
            ? {
                ...user,
                adminType: isSuper ? 'SUPER' : 'ROLE_BASED',
                roleId: newRoleId ?? undefined,
                roleName: nextRole?.name ?? undefined,
              }
            : user
        ),
      };
    });

    setRoleChangeError('');
    setPendingUserIds((prev) => new Set(prev).add(userId));

    assignRole(
      {
        params: {
          path: {
            id: userId,
          },
        },
        // OpenAPI 스키마에 nullable 표기가 누락되어 있으나 백엔드는 roleId=null 을
        // "역할 해제 (슈퍼 관리자 전환)" 로 받는다. 백엔드 스키마 수정 전까지 캐스트로 우회.
        body: {
          roleId: newRoleId,
        } as components['schemas']['AdminRoleAssignRequest'],
      },
      {
        onSuccess: async () => {
          // 본인 역할이 바뀌면 accessibleMenus 갱신 + 현재 경로 권한 재평가
          if (userId === adminSessionStorage.getSession()?.id) {
            await refreshSession();
            await router.invalidate();
          }
        },
        onError: (error) => {
          // 동시 클릭 시 다른 행의 optimistic 상태를 덮어쓰지 않도록 스냅샷 롤백 대신 서버 정합성 복원
          queryClient.invalidateQueries({ queryKey: userListQueryKey });
          setRoleChangeError(getCreateOrUpdateErrorMessage(error));
        },
        onSettled: () => {
          setPendingUserIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        },
      }
    );
  };

  const handleSuccess = (message: string) => {
    refreshUserList();
    setSuccessMessage(message);
    openSuccessModal();
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUserId(null);
    openUserModal();
  };

  const handleOpenEditModal = (userId: number) => {
    setModalMode('edit');
    setSelectedUserId(userId);
    openUserModal();
  };

  const handleCloseUserModal = () => {
    setSelectedUserId(null);
    closeUserModal();
  };

  const handleOpenDeleteModal = (user: AdminResp) => {
    setDeleteTarget(user);
    setDeleteErrorMessage('');
    openDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteErrorMessage('');
    closeDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteErrorMessage('');

    removeUser(
      {
        params: {
          path: {
            id: deleteTarget.id,
          },
        },
      },
      {
        onSuccess: () => {
          handleCloseDeleteModal();
          // handleSuccess → refreshUserList 가 invalidateQueries 로 서버 truth 정합성을 복원한다.
          handleSuccess('관리자 계정 삭제가 완료되었습니다.');
        },
        onError: (error) => {
          setDeleteErrorMessage(getDeleteErrorMessage(error));
        },
      }
    );
  };

  useEffect(() => {
    if (!isDeleteModalOpen) {
      setDeleteErrorMessage('');
    }
  }, [isDeleteModalOpen]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='관리자 계정'>
        <Header.Button Icon={Plus} color='main' onClick={handleOpenCreateModal}>
          관리자 등록
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {roleChangeError && (
          <div className='mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <span className='flex-1'>{roleChangeError}</span>
            <button
              type='button'
              onClick={() => setRoleChangeError('')}
              className='text-xs font-semibold text-red-600 underline-offset-2 hover:underline'>
              닫기
            </button>
          </div>
        )}

        <div className='mb-5 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>계정 목록</h2>
            <p className='mt-1 text-sm text-gray-500'>
              전체 관리자 계정을 조회하고 생성, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <div className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm'>
            총 {userList.length}명
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead>
                <tr className='border-b border-gray-100 bg-gray-50'>
                  <th className='px-6 py-4 text-left text-sm font-bold text-gray-700'>이메일</th>
                  <th className='w-48 px-6 py-4 text-left text-sm font-bold text-gray-700'>
                    관리자 유형
                  </th>
                  <th className='w-48 px-6 py-4 text-left text-sm font-bold text-gray-700'>역할</th>
                  <th className='w-44 px-6 py-4 text-left text-sm font-bold text-gray-700'>관리</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-6 py-12 text-center text-sm font-medium text-gray-500'>
                      관리자 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                ) : userList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-6 py-12 text-center text-sm font-medium text-gray-500'>
                      등록된 관리자 계정이 없습니다.
                    </td>
                  </tr>
                ) : (
                  userList.map((user) => {
                    return (
                      <tr
                        key={user.id}
                        className='border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50'>
                        <td className='px-6 py-4'>
                          <p className='text-sm font-semibold text-gray-900'>{user.email}</p>
                          <p className='mt-1 text-xs font-medium text-gray-500'>{user.name}</p>
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.adminType === 'SUPER'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-main/10 text-main'
                            }`}>
                            {getAdminTypeLabel(user.adminType)}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <select
                            value={user.adminType === 'SUPER' ? 'SUPER' : String(user.roleId ?? '')}
                            onChange={(event) => handleChangeRole(user.id, event.target.value)}
                            disabled={pendingUserIds.has(user.id)}
                            className='focus:border-main focus:ring-main/20 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400'>
                            <option value='SUPER'>슈퍼 관리자</option>
                            {roleList.map((role) => {
                              if (!role.id) return null;

                              return (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              type='button'
                              onClick={() => handleOpenEditModal(user.id)}
                              className='rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                              수정
                            </button>
                            <button
                              type='button'
                              onClick={() => handleOpenDeleteModal(user)}
                              className='rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400'>
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminUserModal
        mode={modalMode}
        userId={selectedUserId}
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        onSuccess={handleSuccess}
      />

      <DeleteUserModal
        user={deleteTarget}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isPending={isDeletePending}
        errorMessage={deleteErrorMessage}
      />

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessMessage('');
          closeSuccessModal();
        }}>
        <OneButtonModalTemplate
          text={successMessage}
          buttonText='확인'
          handleClickButton={() => {
            setSuccessMessage('');
            closeSuccessModal();
          }}
        />
      </Modal>
    </div>
  );
}
