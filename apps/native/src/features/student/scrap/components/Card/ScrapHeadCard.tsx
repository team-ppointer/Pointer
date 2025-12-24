import { colors } from '@/theme/tokens';
import { Plus } from 'lucide-react-native';
import { Pressable, View, Text, Image } from 'react-native';
import { TooltipPopover, AddItemTooltipBox, ReviewItemTooltipBox } from '../Modal/Tooltip';
import { Placement } from 'react-native-popover-view/dist/Types';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { ScrapListItemProps } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useState } from 'react';
import { AddFolderScreenModal, LoadQnaImageScreenModal } from '../Modal/FullScreenModal';
import { ScrollView, TextInput } from 'react-native';
import { showToast } from '../Modal/Toast';
import { openImageLibrary } from '../../utils/imagePicker';
import type { UISortKey, SortOrder } from '../../utils/types';
import { Container } from '@/components/common';
import SortDropdown from '../Modal/SortDropdown';
import { useCreateFolder } from '@/apis';

export const ScrapAddItem = () => {
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isQnaImageModalVisible, setisQnaImageModalVisible] = useState(false);

  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { mutateAsync: createFolder } = useCreateFolder();

  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  const onPressGallery = async () => {
    const image = await openImageLibrary();
    if (image) {
      setSelectedImage(image.uri);
    }
  };

  const handleFolderAdd = async () => {
    if (folderName.trim()) {
      try {
        await createFolder({ name: folderName });
        setFolderName('');
        setSelectedImage('');
        setIsFolderModalVisible(false);
        setTimeout(() => {
          showToast('success', '폴더가 추가되었습니다.');
        }, 300);
      } catch (error) {
        showToast('error', '폴더 추가에 실패했습니다.');
        setSelectedImage('');
      }
    } else {
      showToast('error', '폴더 이름을 입력해주세요.');
    }
  };

  return (
    <>
      <TooltipPopover
        placement={Placement.BOTTOM}
        children={(close) => (
          <AddItemTooltipBox
            onClose={close}
            onOpenFolderModal={() => {
              close();
              setTimeout(() => {
                setIsFolderModalVisible(true);
              }, 200);
            }}
            onOpenQnaImgModal={() => {
              close();
              setTimeout(() => {
                setisQnaImageModalVisible(true);
              }, 200);
            }}
          />
        )}
        from={
          <View className={`h-full w-full items-center gap-3 rounded-[10px] p-[10px]`}>
            <View className='items-center justify-center border-[1.5px] border-dashed border-gray-600 p-[44px]'>
              <Plus size={24} color={colors['gray-600']} />
            </View>
            <View className={`w-full flex-col px-[6px]`}>
              <Text className='text-16sb text-[#1E1E21]'>추가하기</Text>
            </View>
          </View>
        }
      />
      <AddFolderScreenModal
        visible={isFolderModalVisible}
        onCancel={() => {
          setFolderName('');
          setSelectedImage('');
          setIsFolderModalVisible(false);
        }}
        onClose={() => {
          handleFolderAdd();
        }}>
        <View className='flex-1 items-center'>
          <View className='top-[60px] w-[424px] gap-[10px]'>
            <Pressable
              className='min-w-[136px] items-center p-[10px]'
              onPress={() => onPressGallery()}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  className='h-[136px] w-[136px] rounded-[8px]'
                  resizeMode='cover'
                />
              ) : (
                <View className='h-[136px] w-[136px] bg-lime-50' />
              )}
            </Pressable>
            <View className='rounded-[8px] border border-gray-400 bg-white px-3 py-2'>
              <TextInput
                className='text-16sb text-black'
                placeholder='제목없음'
                placeholderTextColor={colors['gray-500']}
                value={folderName}
                onChangeText={setFolderName}
                autoFocus
              />
            </View>
          </View>
        </View>
      </AddFolderScreenModal>
      <LoadQnaImageScreenModal
        visible={isQnaImageModalVisible}
        onCancel={() => {
          setisQnaImageModalVisible(false);
        }}
        onClose={() => {
          setisQnaImageModalVisible(false);
        }}>
        <Container className='items-end gap-[10px] py-[10px]'>
          <SortDropdown
            colors={{
              text: '#FFFFFF',
              border: '#6B6F77',
              checkIcon: '#FFFFFF',
              focusBackground: '#6B6F77',
              background: '#6B6F77',
              itemBackground: '#9FA4AE',
            }}
            ordertype={'IMAGE'}
            orderValue={sortKey}
            setOrderValue={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </Container>
      </LoadQnaImageScreenModal>
    </>
  );
};

export const ScrapReviewItem = ({ props }: { props: ScrapListItemProps }) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <Pressable
      className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}
      onPress={() => navigation.push('ScrapContent', { id: props.id })}>
      <View className={`w-full flex-col px-[6px]`}>
        <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />

        <View className='flex-row items-center justify-between'>
          <View className='flex-[0.8] flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2} ellipsizeMode='tail'>
              {props.name}
            </Text>
            <TooltipPopover
              children={(close) => <ReviewItemTooltipBox props={props} onClose={close} />}
              from={<ChevronDownFilledIcon />}
            />
          </View>
          {props.type === 'FOLDER' && props.scrapCount !== undefined && (
            <Text className='text-12m text-gray-700'>{props.scrapCount}</Text>
          )}
        </View>
        <Text className='text-10r text-gray-700'>
          {new Date(props.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};
