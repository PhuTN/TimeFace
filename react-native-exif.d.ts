declare module 'react-native-exif' {
  const Exif: {
    getExif: (
      uri: string,
      cb: (error: any, exif: Record<string, any>) => void
    ) => void;
  };
  export default Exif;
}
