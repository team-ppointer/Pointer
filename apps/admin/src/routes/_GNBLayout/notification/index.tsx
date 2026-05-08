import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header, Modal, Input, SegmentedControl, ErrorModalTemplate } from '@components';
import { getNotification, postNotification, getStudent } from '@apis';
import { useModal, useSelectedStudent } from '@hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Send,
  AlertCircle,
  Clock,
  ExternalLink,
  Megaphone,
  MessageSquare,
  Sparkles,
  Users,
  User,
  Globe,
  CheckCircle2,
  Link as LinkIcon,
  Hash,
} from 'lucide-react';
import { components } from '@schema';

type NotificationResp = components['schemas']['NotificationResp'];

const NOTIFICATION_TYPES = [
  { label: '과제', value: 'ASSIGNMENT', icon: Megaphone },
  { label: '시스템', value: 'SYSTEM', icon: Sparkles },
  { label: 'Q&A', value: 'QNA', icon: MessageSquare },
  { label: '마케팅', value: 'MARKETING', icon: Bell },
] as const;

const SEND_MODE_OPTIONS = [
  { label: '선택된 학생', value: 'selected', icon: User },
  { label: '전체 학생', value: 'all', icon: Globe },
  { label: '학생 검색', value: 'search', icon: Users },
];

const getTypeInfo = (type: NotificationResp['type']) => {
  switch (type) {
    case 'ASSIGNMENT':
      return { icon: Megaphone, color: 'bg-blue-500', label: '과제' };
    case 'SYSTEM':
      return { icon: Sparkles, color: 'bg-purple-500', label: '시스템' };
    case 'QNA':
      return { icon: MessageSquare, color: 'bg-green-500', label: 'Q&A' };
    case 'MARKETING':
      return { icon: Bell, color: 'bg-orange-500', label: '마케팅' };
    default:
      return { icon: Bell, color: 'bg-gray-500', label: '알림' };
  }
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

const groupNotificationsByDate = (notifications: NotificationResp[]) => {
  const groups: { [key: string]: NotificationResp[] } = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt || '');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let groupKey: string;
    if (diffDays === 0) {
      groupKey = '오늘';
    } else if (diffDays === 1) {
      groupKey = '어제';
    } else if (diffDays < 7) {
      groupKey = '이번 주';
    } else if (diffDays < 30) {
      groupKey = '이번 달';
    } else {
      groupKey = '이전';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]?.push(notification);
  });

  // Sort each group by date (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key]?.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });
  });

  return groups;
};

const GROUP_ORDER = ['오늘', '어제', '이번 주', '이번 달', '이전'];

export const Route = createFileRoute('/_GNBLayout/notification/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();
  const queryClient = useQueryClient();

  // Send modal state
  const {
    isOpen: isSendModalOpen,
    openModal: openSendModal,
    closeModal: closeSendModal,
  } = useModal();

  // Error modal state
  const {
    isOpen: isErrorModalOpen,
    openModal: openErrorModal,
    closeModal: closeErrorModal,
  } = useModal();
  const [errorMessage, setErrorMessage] = useState('');

  // Form state for sending notification
  const [sendMode, setSendMode] = useState<'selected' | 'all' | 'search'>('selected');
  const [notificationType, setNotificationType] = useState<string>('SYSTEM');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationPayload, setNotificationPayload] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');

  // Student search for 'search' mode
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const { data: studentListResponse } = getStudent({ query: studentSearchQuery });
  const studentList = studentListResponse?.data ?? [];

  // Fetch notifications
  const { data: notificationList } = getNotification({
    studentId: selectedStudent?.id || 0,
  });

  const { mutateAsync: sendNotificationMutate, isPending: isSending } = postNotification();

  const notifications = notificationList?.data ?? [];
  const groupedNotifications = groupNotificationsByDate(notifications);

  const handleSendNotification = async () => {
    if (!notificationTitle.trim()) return;

    try {
      const body: components['schemas']['NotificationSendRequest'] = {
        type: notificationType as 'ASSIGNMENT' | 'SYSTEM' | 'QNA' | 'MARKETING',
        title: notificationTitle,
        isAll: sendMode === 'all',
        ...(notificationPayload && { payload: parseInt(notificationPayload, 10) }),
        ...(notificationUrl && { url: notificationUrl }),
      };

      if (sendMode === 'selected' && selectedStudent) {
        body.studentIds = [selectedStudent.id];
      } else if (sendMode === 'search') {
        body.studentIds = selectedStudentIds;
      }

      await sendNotificationMutate({ body });

      // Reset form
      setNotificationTitle('');
      setNotificationPayload('');
      setNotificationUrl('');
      setSelectedStudentIds([]);
      closeSendModal();
    } catch (error) {
      console.error('Failed to send notification:', error);
      const message = (error as { message?: string })?.message || '알림 발송에 실패했습니다.';
      setErrorMessage(message);
      openErrorModal();
    } finally {
      queryClient.invalidateQueries();
    }
  };

  const handleCloseSendModal = () => {
    closeSendModal();
    setNotificationTitle('');
    setNotificationPayload('');
    setNotificationUrl('');
    setSelectedStudentIds([]);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const canSend = () => {
    if (!notificationTitle.trim()) return false;
    if (sendMode === 'selected' && !selectedStudent) return false;
    if (sendMode === 'search' && selectedStudentIds.length === 0) return false;
    return true;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='알림'>
        <div className='flex items-center gap-3'>
          <Header.Button Icon={Send} color='main' onClick={openSendModal}>
            알림 전송
          </Header.Button>
        </div>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {!selectedStudent ? (
          <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
            <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
            <div>
              <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하시면 해당 학생의 알림 기록을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {notifications.length > 0 ? (
              <div className='space-y-6'>
                {GROUP_ORDER.map((groupKey) => {
                  const groupNotifications = groupedNotifications[groupKey];
                  if (!groupNotifications || groupNotifications.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      {/* Group Header */}
                      <div className='mb-3 flex items-center gap-2'>
                        <span className='text-sm font-semibold text-gray-500'>{groupKey}</span>
                        <div className='h-[1px] flex-1 bg-gray-200' />
                      </div>

                      {/* Notification Cards Stack */}
                      <div className='space-y-2'>
                        {groupNotifications.map((notification) => {
                          const typeInfo = getTypeInfo(notification.type);
                          const TypeIcon = typeInfo.icon;
                          const date = new Date(notification.createdAt || '');

                          return (
                            <div
                              key={notification.id}
                              className={`group relative overflow-hidden rounded-2xl border bg-white ${
                                notification.isRead
                                  ? 'border-gray-100'
                                  : 'border-main/20 bg-main/[0.02]'
                              }`}>
                              {/* Unread indicator */}
                              {!notification.isRead && (
                                <div className='bg-main absolute top-0 left-0 h-full w-1' />
                              )}

                              <div className='flex items-start gap-4 p-4 pl-5'>
                                {/* Type Icon */}
                                <div
                                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${typeInfo.color}`}>
                                  <TypeIcon className='h-5 w-5 text-white' />
                                </div>

                                {/* Content */}
                                <div className='min-w-0 flex-1'>
                                  <div className='mb-1 flex items-center gap-2'>
                                    <span className='text-xs font-medium text-gray-400'>
                                      {typeInfo.label}
                                    </span>
                                    {!notification.isRead && (
                                      <span className='bg-main/10 text-main rounded-full px-2 py-0.5 text-[10px] font-semibold'>
                                        읽지 않음
                                      </span>
                                    )}
                                  </div>
                                  <h4
                                    className={`text-sm leading-snug ${
                                      notification.isRead
                                        ? 'text-gray-600'
                                        : 'font-semibold text-gray-900'
                                    }`}>
                                    {notification.title}
                                  </h4>

                                  {/* Metadata */}
                                  <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400'>
                                    <div className='flex items-center gap-1'>
                                      <Clock className='h-3 w-3' />
                                      <span>{formatRelativeTime(date)}</span>
                                    </div>
                                    {notification.payload && (
                                      <div className='flex items-center gap-1'>
                                        <Hash className='h-3 w-3' />
                                        <span>ID: {notification.payload}</span>
                                      </div>
                                    )}
                                    {notification.url && (
                                      <div className='flex items-center gap-1'>
                                        <ExternalLink className='h-3 w-3' />
                                        <span className='max-w-[150px] truncate'>
                                          {notification.url}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Read status */}
                                {notification.isRead && (
                                  <CheckCircle2 className='h-4 w-4 flex-shrink-0 text-gray-300' />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white'>
                <div className='text-center'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                    <Bell className='h-8 w-8 text-gray-300' />
                  </div>
                  <div className='mb-1 text-sm font-medium text-gray-400'>알림이 없습니다</div>
                  <div className='text-xs text-gray-400'>
                    이 학생에게 발송된 알림이 여기에 표시됩니다
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      <Modal isOpen={isSendModalOpen} onClose={handleCloseSendModal}>
        <div className='w-[32rem] rounded-2xl bg-white p-8'>
          {/* Modal Header */}
          <div className='mb-6 flex items-center gap-3'>
            <div className='bg-main flex h-12 w-12 items-center justify-center rounded-2xl'>
              <Send className='h-6 w-6 text-white' />
            </div>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>알림 보내기</h3>
              <p className='text-sm text-gray-500'>학생들에게 푸시 알림을 발송합니다</p>
            </div>
          </div>

          <div className='space-y-5'>
            {/* Send Mode Selection */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700'>발송 대상</label>
              <SegmentedControl
                items={SEND_MODE_OPTIONS}
                value={sendMode}
                onChange={(value) => setSendMode(value as 'selected' | 'all' | 'search')}
              />

              {/* Mode-specific info */}
              <div className='mt-3'>
                {sendMode === 'selected' && (
                  <div
                    className={`rounded-xl p-3 ${
                      selectedStudent
                        ? 'border-main/20 bg-main/5 border'
                        : 'border border-amber-200 bg-amber-50'
                    }`}>
                    {selectedStudent ? (
                      <div className='flex items-center gap-2'>
                        <User className='text-main h-4 w-4' />
                        <span className='text-main text-sm font-medium'>
                          {selectedStudent.name}
                        </span>
                        <span className='text-sm text-gray-500'>에게 발송</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-amber-700'>
                        <AlertCircle className='h-4 w-4' />
                        <span className='text-sm'>학생을 먼저 선택해주세요</span>
                      </div>
                    )}
                  </div>
                )}

                {sendMode === 'all' && (
                  <div className='rounded-xl border border-blue-200 bg-blue-50 p-3'>
                    <div className='flex items-center gap-2 text-blue-700'>
                      <Globe className='h-4 w-4' />
                      <span className='text-sm font-medium'>전체 학생에게 발송됩니다</span>
                    </div>
                  </div>
                )}

                {sendMode === 'search' && (
                  <div className='space-y-3'>
                    <div className='relative'>
                      <Input
                        type='text'
                        placeholder='학생 이름으로 검색...'
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                    </div>
                    {studentSearchQuery && (
                      <div className='max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50'>
                        {studentList.length > 0 ? (
                          studentList.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => toggleStudentSelection(student.id)}
                              className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                                selectedStudentIds.includes(student.id)
                                  ? 'bg-main/10 text-main font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}>
                              <div className='flex items-center justify-between'>
                                <span>{student.name}</span>
                                {selectedStudentIds.includes(student.id) && (
                                  <CheckCircle2 className='text-main h-4 w-4' />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='px-4 py-4 text-center text-sm text-gray-400'>
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    )}
                    {selectedStudentIds.length > 0 && (
                      <div className='text-main text-sm font-medium'>
                        {selectedStudentIds.length}명 선택됨
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700'>알림 유형</label>
              <SegmentedControl
                items={NOTIFICATION_TYPES.map((t) => ({ ...t }))}
                value={notificationType}
                onChange={setNotificationType}
              />
            </div>

            {/* Title */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700'>알림 제목</label>
              <Input
                type='text'
                placeholder='알림 제목을 입력하세요'
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>

            {/* Payload */}
            <div>
              <label className='mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700'>
                <Hash className='h-3.5 w-3.5' />
                Payload (선택)
              </label>
              <Input
                type='number'
                placeholder='관련 리소스 ID (숫자)'
                value={notificationPayload}
                onChange={(e) => setNotificationPayload(e.target.value)}
              />
              <p className='mt-1 text-xs text-gray-400'>연결할 문제, 발행물 등의 ID를 입력하세요</p>
            </div>

            {/* URL */}
            <div>
              <label className='mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700'>
                <LinkIcon className='h-3.5 w-3.5' />
                딥링크 URL (선택)
              </label>
              <Input
                type='text'
                placeholder='pointer://...'
                value={notificationUrl}
                onChange={(e) => setNotificationUrl(e.target.value)}
              />
              <p className='mt-1 text-xs text-gray-400'>알림 클릭 시 이동할 앱 내 경로</p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className='mt-8 flex justify-end gap-3'>
            <button
              type='button'
              onClick={handleCloseSendModal}
              className='rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
              취소
            </button>
            <button
              type='button'
              onClick={handleSendNotification}
              disabled={!canSend() || isSending}
              className='bg-main hover:bg-main/90 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'>
              {isSending ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className='h-4 w-4' />
                  발송하기
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={isErrorModalOpen} onClose={closeErrorModal}>
        <ErrorModalTemplate
          text={errorMessage}
          buttonText='닫기'
          handleClickButton={closeErrorModal}
        />
      </Modal>
    </div>
  );
}
