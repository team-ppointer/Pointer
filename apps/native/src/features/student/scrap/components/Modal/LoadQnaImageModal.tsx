import { Container } from '@/components/common';
import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, View, StyleSheet, Alert, Text } from 'react-native';
import { LoadQnaImageScreenModal } from './FullScreenModal';
import { Check } from 'lucide-react-native';
import { useGetQnaFiles, useCreateScrapFromImage } from '@/apis';

interface LoadQnaImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoadQnaImageModal = ({ visible, onClose, onSuccess }: LoadQnaImageModalProps) => {
  const { data: qnaAllFilesData, isLoading } = useGetQnaFiles();
  const { mutate: createScrapFromImage } = useCreateScrapFromImage();

  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const NUM_COLUMNS = 4;
  const GAP = 5;
  const IMAGE_SIZE = (containerWidth - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

  const toggleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // 선택된 이미지로 스크랩 생성 (AddItemTooltip과 동일한 로직)
  const handleComplete = () => {
    if (!selectedId) {
      Alert.alert('알림', '이미지를 선택해주세요.');
      return;
    }

    createScrapFromImage(
      {
        imageId: selectedId,
      },
      {
        onSuccess: () => {
          Alert.alert('성공', '스크랩이 생성되었습니다.');
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          console.error('스크랩 생성 실패:', error);
          Alert.alert('오류', '스크랩 생성에 실패했습니다.');
        },
      }
    );
  };

  return (
    <>
      <LoadQnaImageScreenModal visible={visible} onCancel={onClose} onClose={handleComplete}>
        <Container className='py-[10px]'>
          <View />
        </Container>
        <Container className='flex-1 py-[10px]'>
          {isLoading ? (
            <View className='items-center justify-center'>
              <Text className='text-white'>로딩 중...</Text>
            </View>
          ) : !qnaAllFilesData?.data || qnaAllFilesData.data.length === 0 ? (
            <View className='items-center justify-center'>
              <Text className='text-white'>이미지가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={qnaAllFilesData.data}
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
