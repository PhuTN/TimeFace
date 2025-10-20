// import React, {forwardRef, useImperativeHandle, useState, useEffect, useRef} from 'react';
// import {View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated} from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
// import DatePicker from 'react-native-date-picker';
// import {useUIFactory} from '../../ui/factory/useUIFactory';

// export interface FilterOptions {
//   requestCode: string;
//   employeeName: string;
//   position: string;
//   department: string;
//   status: string;
//   createdDate: string;
//   otDate: string;
//   sortBy: string;
// }

// interface OTRequestFilterDialogProps {
//   onApplyFilter: (filters: FilterOptions) => void;
//   onClearFilter: () => void;
// }

// export interface OTRequestFilterDialogRef {
//   open: () => void;
//   close: () => void;
// }

// const OTRequestFilterDialog = forwardRef<
//   OTRequestFilterDialogRef,
//   OTRequestFilterDialogProps
// >(({onApplyFilter, onClearFilter}, ref) => {
//   const {theme, lang} = useUIFactory();
//   const [visible, setVisible] = useState(false);
//   const slideAnim = useRef(new Animated.Value(1000)).current; // Start off-screen at bottom

//   const [showCreatedDatePicker, setShowCreatedDatePicker] = useState(false);
//   const [showOTDatePicker, setShowOTDatePicker] = useState(false);

//   const [filters, setFilters] = useState<FilterOptions>({
//     requestCode: '',
//     employeeName: '',
//     position: '',
//     department: '',
//     status: '',
//     createdDate: '',
//     otDate: '',
//     sortBy: '',
//   });

//   // Slide up animation when visible changes
//   useEffect(() => {
//     if (visible) {
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         damping: 20,
//         stiffness: 90,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: 1000,
//         duration: 250,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible, slideAnim]);

//   useImperativeHandle(ref, () => ({
//     open: () => {
//       console.log('Dialog open called');
//       setVisible(true);
//     },
//     close: () => {
//       console.log('Dialog close called');
//       setVisible(false);
//     },
//   }));

//   const handleApplyFilter = () => {
//     onApplyFilter(filters);
//     setVisible(false);
//   };

//   const handleClearFilter = () => {
//     setFilters({
//       requestCode: '',
//       employeeName: '',
//       position: '',
//       department: '',
//       status: '',
//       createdDate: '',
//       otDate: '',
//       sortBy: '',
//     });
//     onClearFilter();
//     setVisible(false);
//   };

//   if (!theme || !lang) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={() => setVisible(false)}>
//       <TouchableOpacity
//         style={styles.modalOverlay}
//         activeOpacity={1}
//         onPress={() => setVisible(false)}>
//         <Animated.View
//           style={[
//             styles.modalContainer,
//             {
//               backgroundColor: theme.colors.background,
//               transform: [{translateY: slideAnim}],
//             },
//           ]}
//           onStartShouldSetResponder={() => true}>
//           {/* Handle Indicator */}
//           <View style={styles.handleContainer}>
//             <View style={[styles.handle, {backgroundColor: theme.colors.borderLight}]} />
//           </View>

//           <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
//             <Text style={[styles.title, {color: theme.colors.text}]}>
//               {lang.t('filterOptions')}
//         </Text>

//         {/* Row 1: Request Code */}
//         <View style={styles.row}>
//           <View style={styles.fullField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('requestCode')}
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.colors.background,
//                   borderColor: theme.colors.borderLight,
//                   color: theme.colors.text,
//                 },
//               ]}
//               placeholder={lang.t('requestCode')}
//               placeholderTextColor={theme.colors.greyText}
//               value={filters.requestCode}
//               onChangeText={text => setFilters({...filters, requestCode: text})}
//             />
//           </View>
//         </View>

//         {/* Row 2: Employee Name & Position */}
//         <View style={styles.row}>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('employeeName')}
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.colors.background,
//                   borderColor: theme.colors.borderLight,
//                   color: theme.colors.text,
//                 },
//               ]}
//               placeholder={lang.t('employeeName')}
//               placeholderTextColor={theme.colors.greyText}
//               value={filters.employeeName}
//               onChangeText={text => setFilters({...filters, employeeName: text})}
//             />
//           </View>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('position')}
//             </Text>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   backgroundColor: theme.colors.background,
//                   borderColor: theme.colors.borderLight,
//                   color: theme.colors.text,
//                 },
//               ]}
//               placeholder={lang.t('position')}
//               placeholderTextColor={theme.colors.greyText}
//               value={filters.position}
//               onChangeText={text => setFilters({...filters, position: text})}
//             />
//           </View>
//         </View>

//         {/* Row 3: Department & Status (Select) */}
//         <View style={styles.row}>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('department')}
//             </Text>
//             <View style={[styles.select, {backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight}]}>
//               <RNPickerSelect
//                 onValueChange={(value) => setFilters({...filters, department: value})}
//                 items={[
//                   {label: 'Engineering', value: 'engineering'},
//                   {label: 'Marketing', value: 'marketing'},
//                   {label: 'Sales', value: 'sales'},
//                   {label: 'HR', value: 'hr'},
//                 ]}
//                 placeholder={{label: lang.t('selectDepartment'), value: null}}
//                 value={filters.department}
//                 style={pickerSelectStyles(theme)}
//                 useNativeAndroidPickerStyle={false}
//                 Icon={() => <Text style={[styles.icon, {color: theme.colors.greyText}]}>▼</Text>}
//               />
//             </View>
//           </View>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('status')}
//             </Text>
//             <View style={[styles.select, {backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight}]}>
//               <RNPickerSelect
//                 onValueChange={(value) => setFilters({...filters, status: value})}
//                 items={[
//                   {label: lang.t('approved'), value: 'approved'},
//                   {label: lang.t('rejected'), value: 'rejected'},
//                   {label: lang.t('pending'), value: 'pending'},
//                 ]}
//                 placeholder={{label: lang.t('selectStatus'), value: null}}
//                 value={filters.status}
//                 style={pickerSelectStyles(theme)}
//                 useNativeAndroidPickerStyle={false}
//                 Icon={() => <Text style={[styles.icon, {color: theme.colors.greyText}]}>▼</Text>}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Row 4: Created Date & OT Date (Date Picker) */}
//         <View style={styles.row}>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('createdDate')}
//             </Text>
//             <TouchableOpacity
//               style={[
//                 styles.select,
//                 {
//                   backgroundColor: theme.colors.background,
//                   borderColor: theme.colors.borderLight,
//                 },
//               ]}
//               onPress={() => setShowCreatedDatePicker(true)}>
//               <Text style={[styles.selectText, {color: filters.createdDate ? theme.colors.text : theme.colors.greyText}]}>
//                 {filters.createdDate || lang.t('selectDate')}
//               </Text>
//               <Text style={[styles.icon, {color: theme.colors.greyText}]}>📅</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.halfField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('otDate')}
//             </Text>
//             <TouchableOpacity
//               style={[
//                 styles.select,
//                 {
//                   backgroundColor: theme.colors.background,
//                   borderColor: theme.colors.borderLight,
//                 },
//               ]}
//               onPress={() => setShowOTDatePicker(true)}>
//               <Text style={[styles.selectText, {color: filters.otDate ? theme.colors.text : theme.colors.greyText}]}>
//                 {filters.otDate || lang.t('selectDate')}
//               </Text>
//               <Text style={[styles.icon, {color: theme.colors.greyText}]}>📅</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Row 5: Sort By */}
//         <View style={styles.row}>
//           <View style={styles.fullField}>
//             <Text style={[styles.label, {color: theme.colors.text}]}>
//               {lang.t('sortBy')}
//             </Text>
//             <View style={[styles.select, {backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight}]}>
//               <RNPickerSelect
//                 onValueChange={(value) => setFilters({...filters, sortBy: value})}
//                 items={[
//                   {label: 'Newest First', value: 'newest'},
//                   {label: 'Oldest First', value: 'oldest'},
//                   {label: 'Name A-Z', value: 'name_asc'},
//                   {label: 'Name Z-A', value: 'name_desc'},
//                 ]}
//                 placeholder={{label: lang.t('selectSortBy'), value: null}}
//                 value={filters.sortBy}
//                 style={pickerSelectStyles(theme)}
//                 useNativeAndroidPickerStyle={false}
//                 Icon={() => <Text style={[styles.icon, {color: theme.colors.greyText}]}>▼</Text>}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[
//               styles.button,
//               styles.clearButton,
//               {borderColor: theme.colors.borderLight},
//             ]}
//             onPress={handleClearFilter}>
//             <Text style={[styles.clearButtonText, {color: theme.colors.text}]}>
//               {lang.t('clearFilter')}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.button, styles.applyButton, {backgroundColor: theme.colors.primary}]}
//             onPress={handleApplyFilter}>
//             <Text style={styles.applyButtonText}>{lang.t('applyFilter')}</Text>
//           </TouchableOpacity>
//         </View>
//           </ScrollView>
//         </Animated.View>
//       </TouchableOpacity>

//       {/* Created Date Picker Modal */}
//       <DatePicker
//         modal
//         open={showCreatedDatePicker}
//         date={new Date()}
//         mode="date"
//         onConfirm={(date) => {
//           setShowCreatedDatePicker(false);
//           setFilters({...filters, createdDate: date.toLocaleDateString()});
//         }}
//         onCancel={() => setShowCreatedDatePicker(false)}
//       />

//       {/* OT Date Picker Modal */}
//       <DatePicker
//         modal
//         open={showOTDatePicker}
//         date={new Date()}
//         mode="date"
//         onConfirm={(date) => {
//           setShowOTDatePicker(false);
//           setFilters({...filters, otDate: date.toLocaleDateString()});
//         }}
//         onCancel={() => setShowOTDatePicker(false)}
//       />
//     </Modal>
//   );
// });

// // Picker select styles
// const pickerSelectStyles = (theme: any) => StyleSheet.create({
//   inputIOS: {
//     fontSize: 14,
//     paddingVertical: 12,
//     paddingHorizontal: 0,
//     color: theme.colors.text,
//     paddingRight: 30,
//   },
//   inputAndroid: {
//     fontSize: 14,
//     paddingVertical: 8,
//     paddingHorizontal: 0,
//     color: theme.colors.text,
//     paddingRight: 30,
//   },
//   placeholder: {
//     color: theme.colors.greyText,
//   },
//   iconContainer: {
//     top: 12,
//     right: 0,
//   },
// });

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '85%',
//     paddingBottom: 20,
//   },
//   handleContainer: {
//     alignItems: 'center',
//     paddingTop: 12,
//     paddingBottom: 8,
//   },
//   handle: {
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     gap: 12,
//   },
//   fullField: {
//     flex: 1,
//   },
//   halfField: {
//     flex: 1,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 6,
//     fontWeight: '500',
//   },
//   input: {
//     height: 44,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 14,
//   },
//   select: {
//     height: 44,
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   selectText: {
//     fontSize: 14,
//     flex: 1,
//   },
//   icon: {
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   button: {
//     flex: 1,
//     height: 48,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//   },
//   clearButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   applyButton: {},
//   applyButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });

// export default OTRequestFilterDialog;
