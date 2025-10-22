import React from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import type {Theme} from '../../../ui/theme/theme';
import type {LanguageResolved} from '../../../ui/factory/abstract';
import CenterModal from '../../common/CenterModal';

export interface TimesheetDetail {
  avatarSource: any;
  name: string;
  position: string;
  department: string;
  month: string;
  year: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  lateCount: number;
  absentCount: number;
  overtimeHours: number;
  leaveCount: number;
}

interface TimesheetDetailModalProps {
  visible: boolean;
  onClose: () => void;
  timesheet: TimesheetDetail | null;
  theme: Theme;
  lang: LanguageResolved;
}

const TimesheetDetailModal: React.FC<TimesheetDetailModalProps> = ({
  visible,
  onClose,
  timesheet,
  theme,
  lang,
}) => {
  if (!timesheet) return null;

  return (
    <CenterModal
      visible={visible}
      onClose={onClose}
      title={lang.t('timesheetDetails')}
      theme={theme}>
      <ScrollView style={{maxHeight: 500}}>
        {/* Employee Info Section */}
        <View style={{marginBottom: 16}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <Image
              source={timesheet.avatarSource}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginRight: 12,
              }}
            />
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.text,
                  marginBottom: 4,
                }}>
                {timesheet.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.mutedText,
                  marginBottom: 2,
                }}>
                {timesheet.position}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.mutedText,
                }}>
                {timesheet.department}
              </Text>
            </View>
          </View>
        </View>

        {/* Period Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
            {lang.t('period')}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.primary,
            }}>
            {timesheet.month} {timesheet.year}
          </Text>
        </View>

        {/* Attendance Summary Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 12,
            }}>
            {lang.t('attendanceSummary')}
          </Text>
          
          {/* Working Days Row */}
          <View style={{flexDirection: 'row', marginBottom: 12}}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('totalWorkingDays')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {timesheet.totalWorkingDays} {lang.t('days')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('actualWorkingDays')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}>
                {timesheet.actualWorkingDays} {lang.t('days')}
              </Text>
            </View>
          </View>

          {/* Late and Absent Row */}
          <View style={{flexDirection: 'row', marginBottom: 12}}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('lateCount')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#F59E0B',
                }}>
                {timesheet.lateCount} {lang.t('times')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('absentCount')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#EF4444',
                }}>
                {timesheet.absentCount} {lang.t('days')}
              </Text>
            </View>
          </View>

          {/* OT and Leave Row */}
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('overtimeHours')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}>
                {timesheet.overtimeHours} {lang.t('hours')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('leaveCount')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {timesheet.leaveCount} {lang.t('days')}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Rate Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
            {lang.t('attendanceRate')}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: theme.colors.primary,
            }}>
            {((timesheet.actualWorkingDays / timesheet.totalWorkingDays) * 100).toFixed(1)}%
          </Text>
        </View>
      </ScrollView>
    </CenterModal>
  );
};

export default TimesheetDetailModal;
