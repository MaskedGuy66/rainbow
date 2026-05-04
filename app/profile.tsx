import { resetBankData } from '@/components/bank-simulator';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, sendEmailVerification, updatePassword, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BankSimulator from '../components/bank-simulator';
import { auth, db } from '../firebase';
import { logout } from '../utils/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bankConnected, setBankConnected] = useState(false);

  // Dữ liệu thực từ hệ thống
  const [dbBalance, setDbBalance] = useState<number>(0);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Hàm điều chỉnh số dư và tự động tạo giao dịch (Dùng để test)
  const adjustBalance = async (amount: number) => {
    if (!user || !bankConnected) return;

    try {
      const bankDocRef = doc(db, 'users', user.uid, 'bankAccount', 'primary');
      const transactionsRef = collection(db, "users", user.uid, "transactions");
      const newBalance = dbBalance + amount;

      if (newBalance < 0) {
        Alert.alert("Lỗi", "Số dư không đủ để thực hiện thao tác này.");
        return;
      }

      // 1. Cập nhật số dư trực tiếp vào DB
      await updateDoc(bankDocRef, {
        balance: newBalance,
        updatedAt: Timestamp.now()
      });

      // 2. Tạo bản ghi giao dịch tự động
      await addDoc(transactionsRef, {
        amount: Math.abs(amount),
        category: "Ngân hàng",
        type: amount > 0 ? "Thu nhập" : "Chi tiêu",
        note: "Biến động số dư (Simulator)",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isAutomatic: true
      });

      console.log("✅ Cập nhật số dư và tạo transaction thành công");
    } catch (error) {
      console.error("❌ Lỗi điều chỉnh số dư:", error);
      Alert.alert("Lỗi", "Không thể ghi nhận biến động số dư.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setNewDisplayName(u.displayName || '');
    });
    return unsubscribe;
  }, []);

  // Lắng nghe dữ liệu ngân hàng REAL-TIME từ Firestore
  useEffect(() => {
    if (!user) return;
    const bankDocRef = doc(db, 'users', user.uid, 'bankAccount', 'primary');
    const unsubscribe = onSnapshot(bankDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbBalance(data.balance || 0);
        setBankName(data.bankName || '');
        setAccountNumber(data.accountNumber || '');
        setBankConnected(true);
      } else {
        setBankConnected(false);
      }
    });
    return unsubscribe;
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      if (newDisplayName.trim() !== user.displayName) {
        await updateProfile(user, { displayName: newDisplayName });
      }
      if (newPassword.length > 0) {
        if (newPassword.length < 6) throw new Error("Mật khẩu mới phải từ 6 ký tự!");
        await updatePassword(user, newPassword);
      }
      Alert.alert("Thành công", "Thông tin đã được cập nhật.");
      setIsEditing(false);
      setNewPassword('');
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      Alert.alert('Đã gửi', 'Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam).');
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu lúc này.');
    }
  };

  if (!user) return <View style={styles.loadingCenter}><ActivityIndicator color="#ff6b9d" /></View>;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* AVATAR SECTION */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.displayName || 'U')[0].toUpperCase()}</Text>
        </View>
        <View style={[styles.verifyTag, user.emailVerified ? styles.verifiedBg : styles.unverifiedBg]}>
          <Text style={[styles.verifyTagText, user.emailVerified ? styles.verifiedText : styles.unverifiedText]}>
            {user.emailVerified ? '✓ Đã xác minh' : '⚠ Chưa xác minh'}
          </Text>
        </View>
        {isEditing ? (
          <TextInput style={styles.editDisplayNameInput} value={newDisplayName} onChangeText={setNewDisplayName} autoFocus />
        ) : (
          <Text style={styles.displayName}>{user.displayName || 'Người dùng'}</Text>
        )}
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      {!user.emailVerified && (
        <TouchableOpacity style={styles.verifyBanner} onPress={handleResendVerification}>
          <Text style={styles.verifyBannerText}>Bấm vào đây để gửi lại email xác nhận tài khoản</Text>
        </TouchableOpacity>
      )}

      {/* SECTION: NGÂN HÀNG (SỬ DỤNG BANK SIMULATOR) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tài chính & Ngân hàng</Text>
        {bankConnected ? (
          <View style={styles.bankCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankNameText}>{bankName}</Text>
              <Text style={styles.accountNumberText}>STK: {accountNumber}</Text>
              <Text style={styles.balanceText}>{dbBalance.toLocaleString()}đ</Text>
              <Text style={styles.dbInfoText}>Chủ thẻ: {user.displayName?.toUpperCase()}</Text>
            </View>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.plusBtn} onPress={() => adjustBalance(500000)}>
                <Text style={styles.plusText}>+500k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.minusBtn} onPress={() => adjustBalance(-200000)}>
                <Text style={styles.minusText}>-200k</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionRow} onPress={() => setShowBankModal(true)}>
            <Text style={styles.actionRowText}>🔗 Liên kết ngân hàng mới</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SECTION: THÔNG TIN CÁ NHÂN */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="Để trống nếu không đổi" />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={updating}>
                <Text style={styles.whiteText}>{updating ? '...' : 'Lưu'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setIsEditing(false)}>
                <Text>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionRow} onPress={() => setIsEditing(true)}>
            <Text style={styles.actionRowText}>Chỉnh sửa tên và mật khẩu</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={() => setShowLogoutModal(true)}>
        <Text style={styles.signOutText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* COMPONENT GIẢ LẬP NGÂN HÀNG */}
      <BankSimulator 
        visible={showBankModal}
        mode="link"
        onClose={() => setShowBankModal(false)}
        onSuccess={(newBalance) => {
          setDbBalance(newBalance);
          setBankConnected(true);
        }}
      />

      {/* MODAL LOGOUT */}
      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận</Text>
            <Text style={styles.modalText}>Bạn có chắc muốn đăng xuất không?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}><Text>Huỷ</Text></TouchableOpacity>
              <TouchableOpacity onPress={async () => { await resetBankData(user.uid); await logout(); router.replace("/login"); }}>
                <Text style={styles.confirmLogoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  backButtonText: { fontSize: 24, color: '#333' },
  title: { fontSize: 20, fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#ff6b9d', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 35, color: '#fff', fontWeight: 'bold' },
  verifyTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginBottom: 10 },
  verifiedBg: { backgroundColor: '#e6fffa' },
  unverifiedBg: { backgroundColor: '#fff5f5' },
  verifyTagText: { fontSize: 12, fontWeight: 'bold' },
  verifiedText: { color: '#38a169' },
  unverifiedText: { color: '#e53e3e' },
  displayName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  editDisplayNameInput: { fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#ff6b9d', width: '60%', textAlign: 'center' },
  emailText: { color: '#888', marginTop: 5 },
  verifyBanner: { backgroundColor: '#fff5f5', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#feb2b2', alignItems: 'center', marginBottom: 20 },
  verifyBannerText: { color: '#c53030', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  sectionContainer: { marginTop: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 12 },
  actionRowText: { fontSize: 15, color: '#333' },
  arrowIcon: { fontSize: 18, color: '#ccc' },
  bankCard: { backgroundColor: '#f0f7ff', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#bae7ff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankNameText: { fontWeight: 'bold', color: '#0050b3', fontSize: 16 },
  accountNumberText: { color: '#555', fontSize: 13 },
  balanceText: { fontSize: 20, fontWeight: 'bold', color: '#cf1322', marginTop: 5 },
  dbInfoText: { fontSize: 11, color: '#666', marginTop: 4, fontStyle: 'italic' },
  balanceActions: { gap: 8, width: 85 },
  plusBtn: { backgroundColor: '#52c41a', padding: 8, borderRadius: 8, alignItems: 'center' },
  plusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  minusBtn: { backgroundColor: '#ff4d4f', padding: 8, borderRadius: 8, alignItems: 'center' },
  minusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  editForm: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12 },
  label: { fontSize: 12, color: '#777', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  editActions: { flexDirection: 'row', gap: 10 },
  saveBtn: { backgroundColor: '#ff6b9d', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center' },
  cancelEditBtn: { backgroundColor: '#eee', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  signOutBtn: { padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#ff6b9d', alignItems: 'center', marginTop: 20, marginBottom: 40 },
  signOutText: { color: '#ff6b9d', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalText: { color: '#666', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 10 },
  cancelBtn: { padding: 5 },
  confirmLogoutText: { color: '#ff4d4d', fontWeight: 'bold', fontSize: 16 },
});