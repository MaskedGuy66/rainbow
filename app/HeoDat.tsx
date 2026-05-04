import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BankSimulator from "../components/bank-simulator";
import { auth, db } from "../firebase";

// Định nghĩa kiểu dữ liệu cho mục tiêu (Goal)
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

/**
 * Component con hiển thị từng ô mục tiêu (Heo đất)
 * Xử lý hiệu ứng Animation khi hoàn thành
 */
const GoalCard = ({ 
  goal, 
  index, 
  startDeposit 
}: { 
  goal: Goal; 
  index: number; 
  startDeposit: (index: number, amount: number) => void; 
}) => {
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  
  // Khởi tạo giá trị Animation (độ mờ từ 0 đến 1)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCompleted) {
      // Chạy hiệu ứng hiện chữ "Hoàn thành" trong 800ms
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      // Nếu chưa hoàn thành (hoặc bị trừ tiền) thì reset về 0
      fadeAnim.setValue(0);
    }
  }, [isCompleted]);

  return (
    <View style={[
      styles.goalCard, 
      isCompleted && styles.completedCard // Chuyển nền xám nếu xong
    ]}>
      
      {/* Lớp phủ chữ Hoàn Thành hiện lên bằng Animation */}
      {isCompleted && (
        <Animated.View style={[styles.completedOverlay, { opacity: fadeAnim }]}>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✨ HOÀN THÀNH ✨</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.goalHeader}>
        <Text style={[styles.goalTitle, isCompleted && styles.grayText]}>
          {goal.name}
        </Text>
        <Text style={[styles.goalPercent, isCompleted && styles.grayText]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* Thanh tiến trình */}
      <View style={styles.progressBarBg}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${progress * 100}%` },
            isCompleted && { backgroundColor: '#9e9e9e' } // Thanh tiến trình màu xám
          ]} 
        />
      </View>

      <Text style={styles.goalMoney}>
        {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} VND
      </Text>

      {/* Nếu đã xong thì hiện thông báo, chưa xong thì hiện ô nhập tiền */}
      {!isCompleted ? (
        <ActionInput 
          actionText="Bỏ heo" 
          onAction={(val) => startDeposit(index, val)} 
        />
      ) : (
        <View style={styles.congratsContainer}>
          <Text style={styles.congratsText}>Chúc mừng! Bạn đã đạt mục tiêu! 🎉</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Component chính HeoDat
 */
const HeoDat: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bankBalance, setBankBalance] = useState(0);
  const [isBankLinked, setIsBankLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [modalMode, setModalMode] = useState<"link" | "otp_only">("link");
  const [pendingTx, setPendingTx] = useState<{index: number, amount: number} | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Lắng nghe danh sách heo đất
    const goalsRef = collection(db, "users", user.uid, "goals");
    const q = query(goalsRef, orderBy("createdAt", "desc"));
    const unsubGoals = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
      setGoals(data);
      setLoading(false);
    });

    // Lắng nghe số dư ngân hàng
    const bankRef = doc(db, "users", user.uid, "bankAccount", "primary");
    const unsubBank = onSnapshot(bankRef, (snap) => {
      if (snap.exists()) {
        setBankBalance(snap.data().balance || 0);
        setIsBankLinked(true);
      } else {
        setIsBankLinked(false);
      }
    });

    return () => { 
      unsubGoals(); 
      unsubBank(); 
    };
  }, []);

  const createGoal = async () => {
    const amount = Number(goalAmount);
    if (!goalName || !goalAmount || amount <= 0) {
      return Alert.alert("Lỗi", "Vui lòng nhập tên và số tiền mục tiêu hợp lệ!");
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "users", user.uid, "goals"), {
        name: goalName,
        targetAmount: amount,
        currentAmount: 0,
        createdAt: Timestamp.now()
      });

      setGoalName("");
      setGoalAmount("");
      Alert.alert("Thành công", "Đã mua thêm một chú heo đất mới! 🐷");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tạo mục tiêu tiết kiệm.");
    }
  };

  const startDeposit = (index: number, amount: number) => {
    if (!isBankLinked) return Alert.alert("Lỗi", "Vui lòng liên kết ngân hàng trước!");
    if (amount <= 0) return Alert.alert("Lỗi", "Số tiền phải lớn hơn 0!");
    if (bankBalance < amount) return Alert.alert("Lỗi", "Số dư ngân hàng không đủ!");
    
    setPendingTx({ index, amount });
    setModalMode("otp_only");
    setShowBankModal(true);
  };

  const handleTransactionSuccess = async (newBalance: number) => {
    if (modalMode === "otp_only" && pendingTx) {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const goal = goals[pendingTx.index];
        const goalRef = doc(db, "users", user.uid, "goals", goal.id);
        
        await updateDoc(goalRef, { 
          currentAmount: goal.currentAmount + pendingTx.amount 
        });

        setPendingTx(null);
      } catch (error) {
        Alert.alert("Lỗi", "Cập nhật dữ liệu thất bại.");
      }
    }
    setBankBalance(newBalance);
    setShowBankModal(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6b9d" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header số dư */}
      <View style={styles.header}>
        <Text style={styles.title}>🐷 Heo Đất Tiết Kiệm</Text>
        <View style={styles.bankInfo}>
          <Text style={styles.bankLabel}>Số dư ngân hàng:</Text>
          <Text style={styles.bankAmount}>{bankBalance.toLocaleString()} VND</Text>
        </View>
      </View>

      {/* Form tạo mới */}
      <View style={styles.createBox}>
        <Text style={styles.subTitle}>Nuôi heo mới</Text>
        <TextInput 
          style={styles.mainInput} 
          placeholder="Tên mục tiêu (VD: Mua điện thoại...)" 
          value={goalName} 
          onChangeText={setGoalName} 
        />
        <TextInput 
          style={styles.mainInput} 
          placeholder="Số tiền cần đạt được" 
          keyboardType="numeric"
          value={goalAmount} 
          onChangeText={setGoalAmount} 
        />
        <TouchableOpacity style={styles.createBtn} onPress={createGoal}>
          <Text style={styles.createBtnText}>+ Bắt đầu tiết kiệm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách các mục tiêu */}
      <Text style={styles.subTitle}>Danh sách mục tiêu ({goals.length})</Text>
      {goals.length === 0 && (
        <Text style={styles.emptyText}>Bạn chưa có chú heo nào. Hãy tạo một cái nhé!</Text>
      )}
      
      {goals.map((goal, index) => (
        <GoalCard 
          key={goal.id} 
          goal={goal} 
          index={index} 
          startDeposit={startDeposit} 
        />
      ))}

      <BankSimulator 
        visible={showBankModal}
        mode={modalMode}
        amount={pendingTx?.amount}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleTransactionSuccess}
      />
    </ScrollView>
  );
};

/**
 * Component phụ trợ cho Input nhập tiền
 */
const ActionInput = ({ actionText, onAction }: { actionText: string, onAction: (v: number) => void }) => {
  const [val, setVal] = useState("");
  return (
    <View style={styles.row}>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={val} 
        onChangeText={setVal} 
        placeholder="Nhập số tiền..." 
      />
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => { 
          if (!val) return Alert.alert("Lỗi", "Nhập số tiền cần nạp!");
          onAction(Number(val)); 
          setVal(""); 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Hệ thống Styles
 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffafc", padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    padding: 20, 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#d63384" },
  bankInfo: { marginTop: 10, alignItems: 'center' },
  bankLabel: { fontSize: 12, color: "#666" },
  bankAmount: { fontSize: 20, fontWeight: "bold", color: "#0077b6" },
  
  createBox: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#ffe3ee' 
  },
  subTitle: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 12 },
  mainInput: { 
    backgroundColor: '#f9f9f9', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  createBtn: { backgroundColor: '#ff6b9d', padding: 15, borderRadius: 10, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: 'bold' },
  
  // Style cho Card Mục tiêu
  goalCard: { 
    backgroundColor: "#fff", 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15, 
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  completedCard: {
    backgroundColor: "#f0f0f0", // Màu nền xám khi hoàn thành
    borderColor: "#d1d1d1",
    borderWidth: 1,
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    transform: [{ rotate: '-10deg' }],
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
  },
  completedText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  grayText: {
    color: '#aaa',
  },
  congratsContainer: {
    padding: 10,
    alignItems: 'center',
  },
  congratsText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalTitle: { fontWeight: "bold", fontSize: 16, color: '#333' },
  goalPercent: { color: '#ff6b9d', fontWeight: 'bold' },
  
  progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#ff6b9d' },
  
  goalMoney: { fontSize: 13, color: '#888', marginBottom: 15 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },

  row: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, borderBottomWidth: 1, borderColor: "#ff6b9d", paddingVertical: 5 },
  btn: { backgroundColor: "#4caf50", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});

export default HeoDat;