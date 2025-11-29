import { Container } from '@components/common';
import { View, Text, ScrollView, Image } from 'react-native';

const NotificationDetailScreen = () => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View className='mx-auto w-full'>
        <Container className='gap-[32px] pt-[16px]'>
          <View className='flex-col gap-0.5'>
            <Text className='text-20b text-gray-900'>공지 제목이 작성돼요.</Text>
            <Text className='text-12m text-gray-700'>크아아아악</Text>
          </View>
          <View className='flex-col items-start justify-start gap-3'>
            <Text className='text-16m text-gray-900'>
              안녕하세요. 저희 서비스에 대한 최신 업데이트 소식을 전해드립니다.
            </Text>
            <Image
              className='h-[182px] w-[324px]'
              style={{ resizeMode: 'contain' }}
              source={{ uri: 'https://pbs.twimg.com/media/EoNK6cQVoAAwvAp.jpg' }}
            />
            <Text className='text-16m text-gray-900'>업데이트된 내용입니다.-1</Text>
            <Image
              className='h-[182px] w-[324px]'
              style={{ resizeMode: 'cover' }}
              source={{ uri: 'https://pbs.twimg.com/media/EoNK6cQVoAAwvAp.jpg' }}
            />
            <Text className='text-16m text-gray-900'>업데이트된 내용입니다.-2 </Text>
            <Text className='text-16m text-gray-900'>
              이번 업데이트에서는 사용자 경험을 개선하기 위한 여러 기능이 추가되었습니다. 새로운
              인터페이스와 향상된 성능을 통해 더욱 편리하게 서비스를 이용하실 수 있습니다. 앞으로도
              많은 관심 부탁드립니다! 이번 업데이트에서는 사용자 경험을 개선하기 위한 여러 기능이
              추가되었습니다. 새로운 인터페이스와 향상된 성능을 통해 더욱 편리하게 서비스를 이용하실
              수 있습니다. 앞으로도 많은 관심 부탁드립니다!
            </Text>
          </View>
        </Container>
      </View>
    </ScrollView>
  );
};

export default NotificationDetailScreen;
