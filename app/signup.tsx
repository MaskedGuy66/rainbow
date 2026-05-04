import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../firebase';
import { signup } from '../utils/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Trạng thái cho Modal thông báo
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'waiting'>('success');
  const [modalMsg, setModalMsg] = useState('');
  
  const router = useRouter();

  // Tự động theo dõi trạng thái xác thực để chuyển hướng khi user nhấn link email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setModalVisible(false);
        router.replace('/'); 
      }
    });
    return unsubscribe;
  }, []);

  const showNotification = (type: 'success' | 'error' | 'waiting', message: string) => {
    setModalType(type);
    setModalMsg(message);
    setModalVisible(true);
    // Nếu là lỗi thì tự đóng sau 2.5 giây
    if (type === 'error') {
      setTimeout(() => setModalVisible(false), 2500);
    }
  };

  const handleSignup = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!displayName || displayName.trim().length < 2) {
      showNotification('error', 'Tên hiển thị phải có ít nhất 2 ký tự!');
      return;
    }
    if (!email.includes('@')) {
      showNotification('error', 'Định dạng email không hợp lệ!');
      return;
    }
    if (password.length < 6) {
      showNotification('error', 'Mật khẩu phải có độ dài từ 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, displayName);
      showNotification(
        'waiting', 
        `📧 Email xác nhận đã được gửi tới:\n${email}\n\nVui lòng kiểm tra hộp thư và bấm vào liên kết để kích hoạt tài khoản.`
      );
    } catch (error: any) {
      let errorMessage = 'Đã xảy ra lỗi không xác định';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được sử dụng bởi một tài khoản khác!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Địa chỉ email không đúng định dạng!';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu, vui lòng chọn mật khẩu khác!';
      }
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>💖</Text>
          <Text style={styles.title}>MoneyMeow</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình tài chính</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Tạo tài khoản</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Tên hiển thị" 
            placeholderTextColor="#ff9ec6"
            value={displayName} 
            onChangeText={setDisplayName} 
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#ff9ec6"
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="Mật khẩu" 
            placeholderTextColor="#ff9ec6"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
          
          <TouchableOpacity 
            style={[styles.confirmBtn, loading && styles.buttonDisabled]} 
            onPress={handleSignup} 
            disabled={loading}
          >
            <Text style={styles.confirmText}>
              {loading ? '🔄 Đang xử lý...' : '🌟 Đăng ký ngay'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginText}>
              Đã có tài khoản? <Text style={styles.loginHighlight}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Thông báo */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, modalType === 'error' && styles.modalErrorBorder]}>
            <Text style={styles.modalIcon}>
              {modalType === 'success' ? '✅' : modalType === 'error' ? '❌' : '📧'}
            </Text>
            <Text style={styles.modalText}>{modalMsg}</Text>
            {modalType === 'waiting' && (
               <Text style={styles.waitingSubText}>
                 Hệ thống sẽ tự động đăng nhập sau khi bạn xác nhận email...
               </Text>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffafc" },
  scrollContent: { flexGrow: 1 },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#fff0f5',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 20,
  },
  logo: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold", color: "#d63384", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#ff6b9d", fontWeight: '500' },
  formContainer: { flex: 1, paddingHorizontal: 30, paddingBottom: 40 },
  formTitle: { fontSize: 24, fontWeight: "bold", color: "#d63384", textAlign: "center", marginBottom: 30 },
  input: {
    borderWidth: 2,
    borderColor: '#ffe6ee',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#d63384',
    marginBottom: 16,
  },
  confirmBtn: {
    backgroundColor: '#ff6b9d',
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  confirmText: { color: "white", fontWeight: "bold", fontSize: 18 },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: '#ff6b9d', fontSize: 14 },
  loginHighlight: { fontWeight: 'bold', color: '#d63384' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd6e7',
  },
  modalErrorBorder: { borderColor: '#ff4d4d' },
  modalIcon: { fontSize: 40, marginBottom: 15 },
  modalText: { fontSize: 16, color: '#d63384', fontWeight: '600', textAlign: 'center' },
  waitingSubText: { fontSize: 12, color: '#777', marginTop: 15, fontStyle: 'italic' }
});