import { Container } from '@/components/common';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, View, StyleSheet, Alert, Text } from 'react-native';
import { LoadQnaImageScreenModal } from './FullScreenModal';
import { Check } from 'lucide-react-native';
import { useGetQnaFiles, useCreateScrapFromImage } from '@/apis';
import { SortOrder, UISortKey } from '../../utils/types';
import { SortDropdown } from '../Dropdown';
import { colors } from '@/theme/tokens';
import { showToast } from '../Notification/Toast';

interface LoadQnaImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoadQnaImageModal = ({ visible, onClose, onSuccess }: LoadQnaImageModalProps) => {
  const { mutateAsync: createScrapFromImage } = useCreateScrapFromImage();

  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

  const [isCreating, setIsCreating] = useState(false);

  const {
    data: qnaAllImagesData,
    isLoading,
    refetch,
  } = useGetQnaFiles({
    sort: 'CREATED_AT',
    order: sortOrder,
  });

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
      showToast('success', '스크랩이 생성되었습니다.');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  return (
    <>
      <LoadQnaImageScreenModal
        visible={visible}
        onCancel={onClose}
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
          {isLoading ? (
            <View className='items-center justify-center'>
              <Text className='text-white'>로딩 중...</Text>
            </View>
          ) : !qnaAllImagesData?.data || qnaAllImagesData.data.length === 0 ? (
            <View className='items-center justify-center'>
              <Text className='text-white'>이미지가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={qnaAllImagesData.data}
              keyExtractor={(item) => item.id.toString()}
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={{ gap: GAP }}
              contentContainerStyle={{ padding: GAP, gap: GAP }}
              onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
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

                    {/* 좌측 상단 체크 아이콘 */}
                    <Pressable
                      onPress={() => toggleSelect(item.id)}
                      style={styles.checkIconWrapper}
                      hitSlop={8}>
                      <Check size={22} color={selected ? '#4F46E5' : '#fff'} />
                    </Pressable>
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
  checkBox: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconWrapper: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    padding: 2,
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
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
