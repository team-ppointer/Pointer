import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import {
  FileText,
  Calendar,
  GraduationCap,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  ChartNoAxesCombined,
  Users,
  Megaphone,
  Tags,
  MessageCircle,
  Bell,
} from 'lucide-react';
import { getStudent } from '@apis';
import { useSelectedStudent } from '@hooks';
import { components } from '@schema';

import { useSidebar } from '@/contexts/SidebarContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon, label, isCollapsed }: NavItemProps) => {
  return (
    <Link
      to={to}
      activeProps={{
        className: 'active',
      }}>
      {({ isActive }) => (
        <div
          className={`relative mb-1 flex h-12 w-full cursor-pointer items-center gap-3.5 overflow-hidden rounded-2xl px-3.5 transition-all duration-300 ${
            isActive ? 'bg-main/10 text-main' : 'text-gray-700 hover:bg-black/5'
          } ${isCollapsed ? 'w-12 px-3.5' : ''}`}>
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-transform duration-300`}>
            {icon}
          </div>
          <span className='text-sm font-semibold tracking-wide whitespace-nowrap'>{label}</span>
        </div>
      )}
    </Link>
  );
};

interface SectionTitleProps {
  children: React.ReactNode;
  isCollapsed: boolean;
}

const SectionTitle = ({ children, isCollapsed }: SectionTitleProps) => {
  return isCollapsed ? (
    <div className='flex h-10 w-full items-center justify-center'>
      <div className='mx-0.5 h-[1px] w-full bg-gray-200'></div>
    </div>
  ) : (
    <div className='flex items-center gap-2 px-2 py-3 text-xs font-bold tracking-widest whitespace-nowrap text-gray-400 uppercase'>
      {children}
    </div>
  );
};

const GNB = () => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedStudent, setSelectedStudent } = useSelectedStudent();
  const { data: studentListResponse } = getStudent({ query: searchQuery });
  const studentList = studentListResponse?.data ?? [];
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (studentSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [studentSearchOpen]);

  useEffect(() => {
    if (isCollapsed) {
      setStudentSearchOpen(false);
    }
  }, [isCollapsed]);

  const handleStudentSelect = (student: components['schemas']['StudentResp']) => {
    setSelectedStudent(student);
    setStudentSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div
      className={`fixed top-0 left-0 z-40 h-screen bg-white shadow-xl shadow-gray-200/50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div className='flex h-full flex-col'>
        {/* Header */}
        <div className='mb-3.5 flex items-center justify-between pt-4 pl-4'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100/80 transition-all duration-300`}>
              <svg
                viewBox='0 0 49 57'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='ml-0.5 h-6 w-6'>
                <path
                  d='M1.60489 0H28.0856C39.1651 0 48.1468 9.44409 48.1468 20.5997C48.1468 31.7552 39.1651 40.7986 28.0856 40.7986C25.8697 40.7986 24.0734 42.6073 24.0734 44.8384V55.3418C24.0734 56.2343 23.3549 56.9577 22.4685 56.9577H17.4973C16.6948 56.9577 15.8924 56.1498 15.8924 55.3418V35.9509C15.8924 34.166 17.3294 32.719 19.1021 32.719H23.6945C25.1895 32.719 26.6638 32.3686 28.0009 31.6954L32.8156 29.2716C39.9129 25.6985 39.9129 15.5008 32.8156 11.9277L28.0009 9.50388C26.6638 8.83074 25.1764 8.01389 23.6815 8.01389H1.59185C0.789399 8.01389 0 7.21907 0 6.41111L0 1.61592C0 0.723471 0.718536 0 1.60489 0Z'
                  fill='#617AF9'
                />
                <path
                  d='M0 55.2827V40.5095V38.8936V17.6437C0 16.7512 0.718535 16.0278 1.60489 16.0278H23.6945C23.9437 16.0278 24.1894 16.0862 24.4123 16.1984L29.2269 18.5842C30.4098 19.1797 30.4098 20.8794 29.2269 21.4749L24.4123 23.8711C24.1894 23.9833 23.9437 24.0417 23.6945 24.0417H9.62936C8.743 24.0417 8.02446 24.7651 8.02446 25.6576V55.2827C8.02446 56.1751 7.30593 56.8986 6.41957 56.8986H1.60489C0.718535 56.8986 0 56.1751 0 55.2827Z'
                  fill='#FFBF00'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex flex-1 flex-col justify-between px-4 pb-4'>
          <div className='flex-1'>
            {/* Student Management Section */}
            <div className=''>
              <SectionTitle isCollapsed={isCollapsed}>학생 관리</SectionTitle>

              {/* Student Selection */}
              <div className='relative'>
                <div
                  onClick={() => {
                    if (isCollapsed) {
                      toggleCollapse();
                    }
                    setStudentSearchOpen(!studentSearchOpen);
                  }}
                  className={`group mb-1.5 flex h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border px-[13px] transition-all duration-300 ${
                    studentSearchOpen ? 'border-main/30' : 'border-gray-200/80 hover:bg-gray-50/50'
                  } ${isCollapsed ? 'w-12' : ''}`}>
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-transform duration-300 ${studentSearchOpen ? 'text-main' : 'text-gray-600'}`}>
                    <GraduationCap className='h-5 w-5' />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span
                        className={`flex-1 truncate text-sm font-semibold tracking-wide ${studentSearchOpen ? 'text-main' : 'text-gray-700'}`}>
                        {selectedStudent ? selectedStudent.name : '학생 선택'}
                      </span>
                      <div
                        className={`transition-transform duration-300 ${studentSearchOpen ? 'text-main rotate-180' : 'text-gray-500'}`}>
                        <ChevronDown className='h-4 w-4' />
                      </div>
                    </>
                  )}
                </div>

                {/* Student Search Dropdown */}
                {studentSearchOpen && !isCollapsed && (
                  <div className='animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-50 mt-1.5 max-h-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl/5 duration-300'>
                    <div className='border-b border-gray-100'>
                      <div className='relative'>
                        <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400' />
                        <input
                          ref={searchInputRef}
                          type='text'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder='학생 이름 검색...'
                          className='w-full py-3 pr-4 pl-10 text-sm font-medium transition-all duration-200 focus:ring-0 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className='max-h-60 overflow-y-auto p-2'>
                      {studentList.length > 0 ? (
                        studentList.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => handleStudentSelect(student)}
                            className={`mb-1 cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                              selectedStudent?.id === student.id
                                ? 'bg-main text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            {student.name}
                          </div>
                        ))
                      ) : (
                        <div className='px-4 py-8 text-center text-sm font-medium text-gray-400'>
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <NavItem
                to='/publish'
                icon={<Calendar className='h-5 w-5' />}
                label='발행'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/notice'
                icon={<Megaphone className='h-5 w-5' />}
                label='공지'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/notification'
                icon={<Bell className='h-5 w-5' />}
                label='알림'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/diagnosis'
                icon={<ChartNoAxesCombined className='h-5 w-5' />}
                label='학생 진단'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/qna'
                icon={<MessageCircle className='h-5 w-5' />}
                label='Q&A'
                isCollapsed={isCollapsed}
              />
            </div>

            {/* Problem Management Section */}
            <div className='space-y-1'>
              <SectionTitle isCollapsed={isCollapsed}>문제 관리</SectionTitle>

              <NavItem
                to='/problem'
                icon={<FileText className='h-5 w-5' />}
                label='문제'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/problem-set'
                icon={<Package className='h-5 w-5' />}
                label='세트'
                isCollapsed={isCollapsed}
              />

              <NavItem
                to='/concept-tags'
                icon={<Tags className='h-5 w-5' />}
                label='개념 태그'
                isCollapsed={isCollapsed}
              />
            </div>

            {/* Teacher Info */}
            <div className='space-y-1'>
              <SectionTitle isCollapsed={isCollapsed}>선생님 관리</SectionTitle>
              <NavItem
                to='/teacher'
                icon={<Users className='h-5 w-5' />}
                label='과외 선생 정보'
                isCollapsed={isCollapsed}
              />
            </div>
          </div>
          <div
            className={`relative mb-1 flex h-12 w-full cursor-pointer items-center gap-3.5 overflow-hidden rounded-2xl px-3.5 text-gray-700 transition-all duration-300 hover:bg-black/5`}
            onClick={toggleCollapse}>
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-transform duration-300`}>
              <ChevronRight
                className={`h-5 w-5 text-gray-600 transition-all group-hover:text-white ${isCollapsed ? '' : 'rotate-180'}`}
              />
            </div>
            <span className='text-sm font-semibold tracking-wide whitespace-nowrap'>
              사이드바 접기
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default GNB;
