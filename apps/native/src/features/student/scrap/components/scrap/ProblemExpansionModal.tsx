import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import ProblemViewer from '../../../problem/components/ProblemViewer';

export interface ProblemExpansionModalProps {
  visible: boolean;
  onClose: () => void;
  problemContent?: string;
  thumbnailUrl?: string;
}

export const ProblemExpansionModal = ({
  visible,
  onClose,
  problemContent,
  thumbnailUrl,
}: ProblemExpansionModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}>
        <Pressable
          style={{
            width: Dimensions.get('window').width * 0.8,
            height: Dimensions.get('window').height * 0.8,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
          }}
          onPress={(e) => e.stopPropagation()}>
          <View className='mb-4 flex-row items-center justify-between'>
            <Text className='text-18b text-[#1E1E21]'>문제 내용</Text>
            <Pressable onPress={onClose} className='rounded-full bg-gray-200 p-2'>
              <X size={20} color='#3E3F45' />
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
            {problemContent && (
              <ProblemViewer problemContent={problemContent} minHeight={400} padding={20} />
            )}
            {!problemContent && thumbnailUrl && (
              <Image
                source={{ uri: thumbnailUrl }}
                style={{ width: '100%', height: 600 }}
                resizeMode='cover'
              />
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
