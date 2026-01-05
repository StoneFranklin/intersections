import { Dimensions, useWindowDimensions } from 'react-native';

export const useResponsiveDimensions = () => {
  const windowDimensions = useWindowDimensions();
  const screenDimensions = Dimensions.get('window');

  const width = windowDimensions.width || screenDimensions.width;
  const height = windowDimensions.height || screenDimensions.height;

  return {
    width,
    height,
    isTablet: width > 600,
    isLargeTablet: width > 900,
    modalMaxWidth: width > 900 ? 600 : width > 600 ? 500 : 400,
  };
};
