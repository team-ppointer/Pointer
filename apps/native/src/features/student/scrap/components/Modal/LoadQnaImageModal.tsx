import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, View, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';

import { SortDropdown } from '../Dropdown';
import { type SortOrder, type UISortKey } from '../../utils/types';
import { showToast } from '../Notification/Toast';
import { useScrapModal } from '../../contexts/ScrapModalsContext';

import { LoadQnaImageScreenModal } from './FullScreenModal';

import { colors } from '@/theme/tokens';
import { useGetQnaFiles, useCreateScrapFromImage } from '@/apis';
import { Container } from '@/components/common';

export const LoadQnaImageModal = () => {
  const { isLoadQnaImageModalVisible, closeLoadQnaImageModal, refetchScraps } = useScrapModal();
  const { mutateAsync: createScrapFromImage } = useCreateScrapFromImage();

  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  const [isCreating, setIsCreating] = useState(false);

  const {
    data: qnaAllImagesData,
    isLoading,
    refetch,
  } = useGetQnaFiles({
    sort: 'CREATED_AT',
    order: sortOrder,
  });

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isLoadQnaImageModalVisible) {
      setSelectedId(null);
    }
  }, [isLoadQnaImageModalVisible]);

  const NUM_COLUMNS = 4;
  const GAP = 5;
  const IMAGE_SIZE = (containerWidth - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

  const toggleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // 선택된 이미지로 스크랩 생성 (AddItemTooltip과 동일한 로직)
  const handleComplete = async () => {
    if (!selectedId) {
      showToast('error', '이미지를 선택해주세요.');
      return;
    }

    try {
      setIsCreating(true);
      await createScrapFromImage({
        imageId: selectedId,
      });
      closeLoadQnaImageModal();
      refetchScraps?.();
      setTimeout(() => {
        showToast('success', '스크랩이 생성되었습니다.');
      }, 0);
    } catch (error: unknown) {
      showToast('error', error instanceof Error ? error.message : '스크랩 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isLoadQnaImageModalVisible) {
      refetch();
    }
  }, [isLoadQnaImageModalVisible, refetch]);

  return (
    <>
      <LoadQnaImageScreenModal
        visible={isLoadQnaImageModalVisible}
        onCancel={closeLoadQnaImageModal}
        onClose={() => {
          if (!isCreating) {
            handleComplete();
          }
        }}>
        <Container className='items-end py-[10px]'>
          <SortDropdown
            ordertype='IMAGE'
            orderValue={sortKey}
            setOrderValue={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            colors={{
              text: '#FFF',
              border: colors['gray-700'],
              background: colors['gray-700'],
              itemBackground: colors['gray-600'],
              focusBackground: colors['gray-700'],
              checkIcon: '#FFF',
            }}
          />
        </Container>
        <Container className='flex-1 py-[10px]'>
          {isLoading && (
            <View className='items-center justify-center'>
              <Text className='text-white'>로딩 중...</Text>
            </View>
          )}
          {!isLoading && (!qnaAllImagesData?.data || qnaAllImagesData.data.length === 0) && (
            <View className='items-center justify-center'>
              <Text className='text-white'>이미지가 없습니다.</Text>
            </View>
          )}
          {!isLoading && qnaAllImagesData?.data && qnaAllImagesData.data.length > 0 && (
            <FlatList
              data={qnaAllImagesData.data}
              keyExtractor={(item) => item.id.toString()}
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={{ gap: GAP }}
              contentContainerStyle={{ padding: GAP, gap: GAP }}
              onLayout={(e) => {
                const w = Math.floor(e.nativeEvent.layout.width);
                if (w > 0 && w !== containerWidth) setContainerWidth(w);
              }}
              renderItem={({ item }) => {
                const selected = selectedId === item.id;

                return (
                  <Pressable
                    delayLongPress={1000}
                    onLongPress={() => setPreviewImage(item.url)}
                    onPress={() => toggleSelect(item.id)}
                    style={[
                      styles.imageWrapper,
                      selected && styles.selectedBorder,
                      {
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                      },
                    ]}>
                    <Image
                      source={{ uri: item.url }}
                      style={StyleSheet.absoluteFill}
                      resizeMode='cover'
                    />

                    {/* 좌측 상단 체크박스 */}
                    <Pressable
                      onPress={() => toggleSelect(item.id)}
                      style={[styles.checkbox, selected && styles.checkboxSelected]}
                      hitSlop={8}>
                      {selected && (
                        <View style={styles.checkIconContainer}>
                          <Check size={10} color='#fff' strokeWidth={2.5} />
                        </View>
                      )}
                    </Pressable>

                    {/* 하단 스크랩 표시 바 */}
                    {item.isScrapped && <View style={styles.bottomBar} />}
                  </Pressable>
                );
              }}
            />
          )}
        </Container>
        <Modal visible={!!previewImage} transparent>
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewImage(null)}>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode='contain'
              />
            )}
          </Pressable>
        </Modal>
      </LoadQnaImageScreenModal>
    </>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: '#617AF9', // primary
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors['gray-700'],
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkboxSelected: {
    backgroundColor: colors['blue-500'],
    borderWidth: 0,
    width: 16,
    height: 16,
  },
  checkIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: 12,
    backgroundColor: colors['primary-500'],
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '90%',
  },
});
