import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase";

// Hàm tiện ích để xóa dữ liệu ngân hàng khi đăng xuất
// Bạn sẽ gọi hàm này trong hàm handleLogout ở các màn hình khác
export const resetBankData = async (uid: string) => {
  try {
    const bankRef = doc(db, "users", uid, "bankAccount", "primary");
    await deleteDoc(bankRef);
    console.log("✅ Đã reset dữ liệu ngân hàng giả lập.");
  } catch (error) {
    console.error("❌ Lỗi khi reset dữ lineage ngân hàng:", error);
  }
};

interface BankSimulatorProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  mode: "link" | "otp_only";
  amount?: number;
}

const BANK_LIST = ["Vietcombank", "Techcombank", "MB Bank", "TPBank", "Agribank", "BIDV", "VPBank", "ACB"];

const BankSimulator: React.FC<BankSimulatorProps> = ({ visible, onClose, onSuccess, mode, amount }) => {
  const [step, setStep] = useState<"input" | "otp">("input");
  const [searchBank, setSearchBank] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (visible) {
      setStep(mode === "otp_only" ? "otp" : "input");
      setOtpInput("");
      if (mode === "otp_only") Alert.alert("Mã OTP Test", "123456");
    }
  }, [visible, mode]);

  const handleStartProcess = () => {
    if (mode === "link") {
      if (!bankName || accountNumber.length < 8) {
        Alert.alert("Lỗi", "Vui lòng chọn ngân hàng và nhập STK!");
        return;
      }
    }
    setStep("otp");
    Alert.alert("Thông báo", "Mã OTP xác thực là: 123456");
  };

  const handleConfirm = async () => {
    if (otpInput !== "123456") return Alert.alert("Lỗi", "OTP sai!");
    if (!user) return;

    setLoading(true);
    try {
      const bankRef = doc(db, "users", user.uid, "bankAccount", "primary");
      let finalBalance = 0;

      if (mode === "link") {
        finalBalance = 1000000; // Số dư mặc định khi liên kết mới
        await setDoc(bankRef, {
          bankName,
          accountNumber,
          ownerName: user.displayName || "Người dùng",
          balance: finalBalance,
          updatedAt: new Date(),
        });
      } else if (mode === "otp_only" && amount) {
        const snap = await getDoc(bankRef);
        finalBalance = (snap.data()?.balance || 0) - amount;
        await updateDoc(bankRef, { balance: finalBalance });
      }

      onSuccess(finalBalance);
      onClose();
      Alert.alert("Thành công", "Thao tác đã được thực hiện!");
    } catch (error) {
      Alert.alert("Lỗi", "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{step === "input" ? "Liên kết ngân hàng" : "Xác thực OTP"}</Text>

          {step === "input" ? (
            <View style={{ width: "100%" }}>
              <TextInput style={styles.input} placeholder="Tìm ngân hàng..." onChangeText={setSearchBank} />
              <ScrollView style={styles.bankList}>
                {BANK_LIST.filter(b => b.toLowerCase().includes(searchBank.toLowerCase())).map(b => (
                  <TouchableOpacity key={b} onPress={() => setBankName(b)} style={[styles.bankItem, bankName === b && styles.selectedBank]}>
                    <Text style={{ color: bankName === b ? "#fff" : "#333" }}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={styles.input} placeholder="Số tài khoản" keyboardType="numeric" value={accountNumber} onChangeText={setAccountNumber} />
              {accountNumber.length >= 8 && <Text style={styles.ownerText}>Chủ TK: {user?.displayName?.toUpperCase()}</Text>}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleStartProcess}><Text style={styles.btnText}>Tiếp tục</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: "100%", alignItems: "center" }}>
              <Text style={{ marginBottom: 10 }}>Số tiền giao dịch: {amount?.toLocaleString() || 0}đ</Text>
              <TextInput style={[styles.input, { textAlign: 'center', fontSize: 24, width: '100%' }]} placeholder="123456" keyboardType="numeric" value={otpInput} onChangeText={setOtpInput} maxLength={6} />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Xác nhận OTP</Text>}
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 15 }}><Text style={{ color: '#999', textAlign: 'center' }}>Hủy bỏ</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  container: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", textAlign: 'center', marginBottom: 20, color: '#d63384' },
  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 10 },
  bankList: { maxHeight: 120, marginBottom: 10 },
  bankItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  selectedBank: { backgroundColor: '#ff6b9d', borderRadius: 5 },
  ownerText: { color: '#28a745', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  primaryBtn: { backgroundColor: "#ff6b9d", padding: 15, borderRadius: 10, alignItems: "center", width: '100%' },
  btnText: { color: "#fff", fontWeight: "bold" }
});

export default BankSimulator;