import { Camera, Image, Images, FolderPlus } from 'lucide-react-native';
import { View, Text, Pressable, Alert } from 'react-native';
import { openCamera, openImageLibrary } from '../../../utils/imagePicker';
import { useGetPreSignedUrl } from '@/apis/controller/common';
import { useCreateScrapFromImage } from '@/apis';

export interface AddItemTooltipProps {
  onClose?: () => void;
  onOpenFolderModal?: () => void;
  onOpenQnaImgModal?: () => void;
}

export const AddItemTooltip = ({
  onClose,
  onOpenQnaImgModal,
  onOpenFolderModal,
}: AddItemTooltipProps) => {
  const { mutate: getPreSignedUrl } = useGetPreSignedUrl();
  const { mutate: createScrapFromImage } = useCreateScrapFromImage();

  // S3에 파일 업로드
  const uploadFileToS3 = async (
    uploadUrl: string,
    fileUri: string,
    contentDisposition: string
  ): Promise<boolean> => {
    try {
      // React Native에서 파일 읽기
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // S3에 PUT 요청
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'content-disposition': contentDisposition,
        },
        body: blob,
      });

      return uploadResponse.ok;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      return false;
    }
  };

  // 이미지 선택 및 업로드 처리
  const handleImageSelect = async (image: any) => {
    if (!image || !image.uri) {
      return;
    }

    try {
      // 파일명 추출 (없으면 기본값 사용)
      const fileName = image.fileName || `image_${Date.now()}.jpg`;

      // 1. Pre-signed URL 요청
      getPreSignedUrl(
        { fileName },
        {
          onSuccess: async (data) => {
            const { uploadUrl, contentDisposition, file } = data;

            if (!uploadUrl) {
              Alert.alert('오류', '업로드 URL을 받아오지 못했습니다.');
              return;
            }

            // 2. S3에 파일 업로드
            const uploadSuccess = await uploadFileToS3(uploadUrl, image.uri, contentDisposition);

            if (!uploadSuccess) {
              Alert.alert('오류', '파일 업로드에 실패했습니다.');
              return;
            }

            // 3. 이미지 기반 스크랩 생성
            createScrapFromImage(
              {
                imageId: file.id,
              },
              {
                onSuccess: () => {
                  Alert.alert('성공', '스크랩이 생성되었습니다.');
                  onClose?.();
                },
                onError: (error) => {
                  console.error('스크랩 생성 실패:', error);
                  Alert.alert('오류', '스크랩 생성에 실패했습니다.');
                },
              }
            );
          },
          onError: (error) => {
            console.error('Pre-signed URL 요청 실패:', error);
            Alert.alert('오류', '파일 업로드 준비에 실패했습니다.');
          },
        }
      );
    } catch (error) {
      console.error('이미지 처리 실패:', error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
    }
  };

  const onPressCamera = async () => {
    try {
      const image = await openCamera();
      if (image) {
        await handleImageSelect(image);
      }
    } catch (error: any) {
      if (error.message?.includes('permission')) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      } else {
        console.error('카메라 오류:', error);
      }
    }
  };

  const onPressGallery = async () => {
    try {
      const image = await openImageLibrary();
      if (image) {
        await handleImageSelect(image);
      }
    } catch (error: any) {
      if (error.message?.includes('permission')) {
        Alert.alert('권한 필요', '갤러리 권한이 필요합니다.');
      } else {
        console.error('갤러리 오류:', error);
      }
    }
  };

  return (
    <View className='h-[176px] w-[228px] flex-col rounded-[10px] bg-white'>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => onPressCamera()}>
        <Camera size={20} />
        <Text className='text-16r text-black'>사진 찍기</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => onPressGallery()}>
        <Image size={20} />
        <Text className='text-16r text-black'>이미지 선택</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => {
          onOpenQnaImgModal?.();
        }}>
        <Images size={20} />
        <Text className='text-16r text-black'>QnA 사진 불러오기</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={() => {
          onOpenFolderModal?.();
        }}>
        <FolderPlus size={20} />
        <Text className='text-16r text-black'>폴더 추가하기</Text>
      </Pressable>
    </View>
  );
};
