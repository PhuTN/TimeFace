import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import HeaderBar from "../components/common/HeaderBar";
import Toast from "react-native-toast-message";
import { apiHandle } from "../api/apihandle";
import { CompanyEP } from "../api/endpoint/Company";

export default function AttendanceConfigScreen({ navigation }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"time" | "date">("time");
  const [pickerDate, setPickerDate] = useState(new Date());
  const [currentField, setCurrentField] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  /* ============================================
   * UPDATE STATE
   * ============================================ */
  const update = (group, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  /* ============================================
   * LOAD CONFIG FROM API
   * ============================================ */
  const loadConfig = async () => {
    const { status, res } = await apiHandle
      .callApi(CompanyEP.GetAttendanceConfig)
      .asPromise();

    if (status.isError) return;

    console.log("📥 CONFIG FROM API:", res);

    // chỉ dùng config từ API, không dùng default nữa
    if (!res) return;

    setConfig(res);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /* ============================================
   * SAVE CONFIG
   * ============================================ */
  const saveConfig = async () => {
    const { status } = await apiHandle
      .callApi(CompanyEP.UpdateAttendanceConfig, config)
      .asPromise();

    if (!status.isError) {
      Toast.show({
        type: "success",
        text1: "Cập nhật thành công!",
      });
    }
  };

  /* ============================================
   * TIME PICKER
   * ============================================ */
  const openTimePicker = (group, key, currentValue) => {
    setPickerMode("time");

    const d = new Date();
    const [h, m] = currentValue.split(":");
    d.setHours(Number(h), Number(m), 0, 0);

    setPickerDate(d);
    setCurrentField({ group, key });
    setShowPicker(true);
  };

  /* ============================================
   * DATE PICKER
   * ============================================ */
  const openDatePicker = () => {
    setPickerMode("date");
    const tomorrow = dayjs().add(1, "day").toDate();
    setPickerDate(tomorrow);
    setCurrentField({ group: "working_hours", key: "company_holidays" });
    setShowPicker(true);
  };

  /* ============================================
   * CONFIRM PICKER — FIX BUG Ở ĐÂY
   * ============================================ */
  const onConfirmPicker = (value) => {
    setShowPicker(false);

    if (!currentField) return;

    if (pickerMode === "time") {
      const d = new Date(value);
      let h = d.getHours();
      let m = d.getMinutes();

      h = Math.max(0, Math.min(23, h));
      m = Math.max(0, Math.min(59, m));

      const timeStr = dayjs(d).format("HH:mm");
      update(currentField.group, currentField.key, timeStr);
    }

    if (pickerMode === "date") {
      const chosen = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");

      if (!chosen.isAfter(today)) {
        Toast.show({
          type: "error",
          text1: "Chỉ được chọn ngày nghỉ lớn hơn ngày hiện tại",
        });
        return;
      }

      const newDateStr = chosen.format("YYYY-MM-DD");

      setConfig((prev) => {
        const current =
          prev?.working_hours?.company_holidays?.slice() ?? [];

        if (current.includes(newDateStr)) {
          Toast.show({
            type: "info",
            text1: "Ngày này đã tồn tại",
          });
          return prev;
        }

        return {
          ...prev,
          working_hours: {
            ...prev.working_hours,
            company_holidays: [...current, newDateStr].sort(),
          },
        };
      });
    }
  };

  /* ============================================
   * REMOVE HOLIDAY
   * ============================================ */
  const removeHoliday = (dateStr: string) => {
    const today = dayjs().startOf("day");
    const d = dayjs(dateStr).startOf("day");

    if (!d.isAfter(today)) {
      Toast.show({
        type: "info",
        text1: "Không thể xóa ngày nghỉ nhỏ hơn hoặc bằng hôm nay",
      });
      return;
    }

    setConfig((prev) => {
      const current =
        prev?.working_hours?.company_holidays?.slice() ?? [];
      return {
        ...prev,
        working_hours: {
          ...prev.working_hours,
          company_holidays: current.filter((x) => x !== dateStr),
        },
      };
    });
  };

  /* ============================================
   * LOADING
   * ============================================ */
  if (!config) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải cấu hình...</Text>
      </View>
    );
  }

  /* ============================================
   * UI
   * ============================================ */
  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title="Cấu hình chấm công" onBack={() => navigation.goBack()} />

      <ScrollView style={{ padding: 16 }}>
        {/* ==== WORKING HOURS ==== */}
        <Card title="Giờ làm việc">
          <Row label="Giờ bắt đầu">
            <TimeBox
              value={config.working_hours.start_time}
              onPress={() =>
                openTimePicker(
                  "working_hours",
                  "start_time",
                  config.working_hours.start_time
                )
              }
            />
          </Row>

          <Row label="Giờ kết thúc">
            <TimeBox
              value={config.working_hours.end_time}
              onPress={() =>
                openTimePicker(
                  "working_hours",
                  "end_time",
                  config.working_hours.end_time
                )
              }
            />
          </Row>

          <Row label="Nghỉ trưa từ">
            <TimeBox
              value={config.working_hours.break_start}
              onPress={() =>
                openTimePicker(
                  "working_hours",
                  "break_start",
                  config.working_hours.break_start
                )
              }
            />
          </Row>

          <Row label="Nghỉ trưa đến">
            <TimeBox
              value={config.working_hours.break_end}
              onPress={() =>
                openTimePicker(
                  "working_hours",
                  "break_end",
                  config.working_hours.break_end
                )
              }
            />
          </Row>

          <Row label="Ngày làm trong tuần">
            <TagList
              list={config.working_hours.working_days}
              setList={(v) => update("working_hours", "working_days", v)}
            />
          </Row>

          <Row label="Ngày nghỉ công ty">
            <TouchableOpacity style={styles.addBtn} onPress={openDatePicker}>
              <Text style={{ fontWeight: "700" }}>+ Thêm ngày</Text>
            </TouchableOpacity>

            {config.working_hours.company_holidays.map((d, idx) => {
              const isFuture = dayjs(d).isAfter(dayjs(), "day");
              return (
                <View key={idx} style={styles.holidayItem}>
                  <Text style={styles.holidayText}>• {d}</Text>
                  {isFuture && (
                    <TouchableOpacity
                      style={styles.holidayDeleteBtn}
                      onPress={() => removeHoliday(d)}
                    >
                      <Text style={styles.holidayDeleteText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </Row>
        </Card>

        {/* ==== LATE RULE ==== */}
        <Card title="Đi trễ">
          <Row label="Cho phép trễ (phút)">
            <Input
              value={config.late_rule.allow_minutes}
              onChange={(v) => update("late_rule", "allow_minutes", v)}
              keyboardType="numeric"
            />
          </Row>

          <Row label="Trừ từng phút?">
            <Toggle
              value={config.late_rule.deduct_per_minute}
              onChange={(v) => update("late_rule", "deduct_per_minute", v)}
            />
          </Row>

          {!config.late_rule.deduct_per_minute && (
            <Row label="Block trễ (phút)">
              <Input
                value={config.late_rule.unit_minutes}
                onChange={(v) => update("late_rule", "unit_minutes", v)}
                keyboardType="numeric"
              />
            </Row>
          )}

          <Row label="Trễ tối đa xem như nghỉ (phút)">
            <Input
              value={config.late_rule.max_late_as_absent_minutes}
              onChange={(v) =>
                update("late_rule", "max_late_as_absent_minutes", v)
              }
              keyboardType="numeric"
            />
          </Row>
        </Card>

        {/* ==== EARLY LEAVE ==== */}
        <Card title="Về sớm">
          <Row label="Trừ từng phút?">
            <Toggle
              value={config.early_leave_rule.deduct_per_minute}
              onChange={(v) => update("early_leave_rule", "deduct_per_minute", v)}
            />
          </Row>

          {!config.early_leave_rule.deduct_per_minute && (
            <Row label="Block về sớm (phút)">
              <Input
                value={config.early_leave_rule.unit_minutes}
                onChange={(v) => update("early_leave_rule", "unit_minutes", v)}
                keyboardType="numeric"
              />
            </Row>
          )}

          <Row label="Về sớm tối đa xem như nghỉ (phút)">
            <Input
              value={config.early_leave_rule.max_early_as_absent_minutes}
              onChange={(v) =>
                update("early_leave_rule", "max_early_as_absent_minutes", v)
              }
              keyboardType="numeric"
            />
          </Row>
        </Card>

        {/* ==== OT POLICY ==== */}
        <Card title="Tăng ca (OT)">
          <Row label="Min OT (phút)">
            <Input
              value={config.overtime_policy.min_ot_minutes}
              onChange={(v) =>
                update("overtime_policy", "min_ot_minutes", v)
              }
              keyboardType="numeric"
            />
          </Row>

          <Row label="Làm tròn (phút)">
            <Input
              value={config.overtime_policy.round_to_minutes}
              onChange={(v) =>
                update("overtime_policy", "round_to_minutes", v)
              }
              keyboardType="numeric"
            />
          </Row>

          <Row label="Hệ số ngày thường">
            <Input
              value={config.overtime_policy.weekday_rate}
              onChange={(v) =>
                update("overtime_policy", "weekday_rate", v)
              }
            />
          </Row>

          <Row label="Hệ số cuối tuần">
            <Input
              value={config.overtime_policy.weekend_rate}
              onChange={(v) =>
                update("overtime_policy", "weekend_rate", v)
              }
            />
          </Row>

          <Row label="Hệ số lễ">
            <Input
              value={config.overtime_policy.holiday_rate}
              onChange={(v) =>
                update("overtime_policy", "holiday_rate", v)
              }
            />
          </Row>
        </Card>

        {/* ==== LEAVE POLICY ==== */}
        <Card title="Chính sách nghỉ phép">
          <Row label="Ngày phép năm">
            <Input
              value={config.leave_policy.annual_leave_days}
              onChange={(v) =>
                update("leave_policy", "annual_leave_days", v)
              }
              keyboardType="numeric"
            />
          </Row>

          <Row label="Cho phép nghỉ 1/2 ngày?">
            <Toggle
              value={config.leave_policy.allow_half_day}
              onChange={(v) =>
                update("leave_policy", "allow_half_day", v)
              }
            />
          </Row>

          <Row label="Nghỉ có lương">
            <LeaveTagSelector
              list={config.leave_policy.paid_leave_types}
              setList={(v) => update("leave_policy", "paid_leave_types", v)}
            />
          </Row>
        </Card>

        {/* ==== SALARY POLICY ==== */}
        <Card title="Cấu hình lương">
          <Row label="Ngày công / tháng">
            <Input
              value={config.salary_policy.workdays_per_month}
              onChange={(v) =>
                update("salary_policy", "workdays_per_month", v)
              }
              keyboardType="numeric"
            />
          </Row>

          <Row label="Giờ làm / ngày">
            <Input
              value={config.salary_policy.hours_per_day}
              onChange={(v) =>
                update("salary_policy", "hours_per_day", v)
              }
              keyboardType="numeric"
            />
          </Row>
        </Card>

        <TouchableOpacity style={styles.saveBtn} onPress={saveConfig}>
          <Text style={styles.saveText}>LƯU CẤU HÌNH</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ==== PICKER ==== */}
      <DatePicker
        modal
        open={showPicker}
        date={pickerDate}
        mode={pickerMode}
        minimumDate={
          pickerMode === "date" ? dayjs().add(1, "day").toDate() : undefined
        }
        onConfirm={(value) => {
          onConfirmPicker(value); // FIX BUG
        }}
        onCancel={() => setShowPicker(false)}
      />
    </View>
  );
}

/* COMPONENTS */
const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, children }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const TimeBox = ({ value, onPress }) => (
  <TouchableOpacity style={styles.timeInput} onPress={onPress}>
    <Text>{value}</Text>
  </TouchableOpacity>
);

const Input = ({ value, onChange, ...rest }) => (
  <TextInput
    style={styles.input}
    value={value}
    onChangeText={onChange}
    {...rest}
  />
);

const Toggle = ({ value, onChange }) => (
  <TouchableOpacity
    style={[
      styles.toggle,
      { backgroundColor: value ? "#4CAF50" : "#aaa" },
    ]}
    onPress={() => onChange(!value)}
  >
    <Text style={{ color: "#fff" }}>{value ? "ON" : "OFF"}</Text>
  </TouchableOpacity>
);

const days = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

const TagList = ({ list, setList }) => {
  const toggle = (key) => {
    if (list.includes(key)) setList(list.filter((x) => x !== key));
    else setList([...list, key]);
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {days.map((d) => (
        <TouchableOpacity
          key={d.key}
          onPress={() => toggle(d.key)}
          style={[
            styles.tag,
            {
              backgroundColor: list.includes(d.key) ? "#007AFF" : "#ddd",
            },
          ]}
        >
          <Text
            style={{ color: list.includes(d.key) ? "#fff" : "#000" }}
          >
            {d.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LeaveTagSelector = ({ list, setList }) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const name = newTag.trim();
    if (!name) return;
    if (list.some((t) => t.name === name)) return;

    const newItem = {
      _id: Date.now().toString(),
      name,
    };

    setList([...list, newItem]);
    setNewTag("");
  };

  const removeTag = (id) => {
    setList(list.filter((t) => t._id !== id));
  };

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {list.map((item) => (
          <View key={item._id} style={[styles.tag, styles.tagPaid]}>
            <Text style={{ color: "#fff", marginRight: 6 }}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => removeTag(item._id)}>
              <Text style={{ color: "#fff", fontWeight: "900" }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TextInput
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Nhập loại nghỉ..."
          style={[styles.input, { flex: 1, marginRight: 8 }]}
        />
        <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tagPaid: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  addTagBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 50,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  holidayItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  holidayText: {
    flex: 1,
  },
  holidayDeleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    marginLeft: 8,
  },
  holidayDeleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});
 