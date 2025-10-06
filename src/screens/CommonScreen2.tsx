import React, { useRef } from 'react';
import {View, Text, Button, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import FilterChip from '../components/group2/FilterChip';
import Chip from '../components/group2/Chip';
import OTRequest from '../components/group2/OTRequest';
import OTRequestFilterDialog, { OTRequestFilterDialogRef, FilterOptions } from '../components/group2/OTRequestFilterDialog';
import { setUIState } from '../ui/factory/selector';

const CommonScreen2: React.FC = () => {
  const {loading, lang, theme} = useUIFactory();
  const filterDialogRef = useRef<OTRequestFilterDialogRef>(null);

  const handleFilterPress = () => {
    console.log('Filter button pressed');
    console.log('Dialog ref:', filterDialogRef.current);
    filterDialogRef.current?.open();
  };

  const handleApplyFilter = (filters: FilterOptions) => {
    console.log('Filters applied:', filters);
    // TODO: Apply filters to OT request list
  };

  const handleClearFilter = () => {
    console.log('Filters cleared');
    // TODO: Clear filters and refresh OT request list
  };

  if (loading || !theme || !lang) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Filter Button */}
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={handleFilterPress}
        >
          <Image 
            source={require('../assets/images/filter_button.png')} 
            style={styles.filterIcon}
          />
        </TouchableOpacity>

        {/* Example usage */}
        <FilterChip
          mainText="Example Filter"
          subText="Sub text here"
          onRemove={() => console.log('Remove')}
          theme={theme}
        />
        <Chip text="Example Chip" />
        <OTRequest
          avatarSource={require('../assets/images/delete.png')} // placeholder
          name="John Doe"
          position="Developer"
          status="pending"
          code="High"
          date="15/05/2025"
          time="17h - 19h"
          createdAt="12/05/2025"
        />
        {/* Đổi theme */}
              <Button title={lang.t("theme.dark")} onPress={() => setUIState({ theme: "dark" })} />
              <Button title={lang.t("theme.light")} onPress={() => setUIState({ theme: "light" })} />
        
              <View style={{ height: theme.spacing(2) }} />
        
              {/* Đổi ngôn ngữ */}
              <Button title="Tiếng Việt" onPress={() => setUIState({ lang: "vi" })} />
              <Button title="English" onPress={() => setUIState({ lang: "en" })} />
      </View>

      {/* Filter Dialog - Outside main container for proper z-index */}
      <OTRequestFilterDialog 
        ref={filterDialogRef}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: 16,
  },
  filterIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default CommonScreen2;
