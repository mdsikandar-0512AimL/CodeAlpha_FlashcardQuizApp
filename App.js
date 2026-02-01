import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default function App() {
  const [cards, setCards] = useState([
    { id: '1', question: 'What is the capital of India?', answer: 'New Delhi' },
    { id: '2', question: 'How many continents are there?', answer: '7' },
    { id: '3', question: 'What color is the sky on a clear day?', answer: 'Blue' },
  ]);

  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'study', 'add'
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // For add / edit
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingCardId, setEditingCardId] = useState(null); // null = adding new, otherwise = editing this id

  // ──────────────── Helper functions ────────────────
  const saveCard = () => {
    if (newQuestion.trim() === '' || newAnswer.trim() === '') {
      Alert.alert('Missing information', 'Please fill both question and answer');
      return;
    }

    const trimmedQ = newQuestion.trim();
    const trimmedA = newAnswer.trim();

    if (editingCardId) {
      // Edit existing
      setCards(cards.map(card => 
        card.id === editingCardId 
          ? { ...card, question: trimmedQ, answer: trimmedA }
          : card
      ));
      Alert.alert('Updated', 'Card has been updated!');
    } else {
      // Add new
      const newCard = {
        id: Date.now().toString(),
        question: trimmedQ,
        answer: trimmedA,
      };
      setCards([...cards, newCard]);
      Alert.alert('Success', 'New card added!');
    }

    // Reset & go back
    setNewQuestion('');
    setNewAnswer('');
    setEditingCardId(null);
    setCurrentScreen('home');
  };

  const startEdit = (card) => {
    setNewQuestion(card.question);
    setNewAnswer(card.answer);
    setEditingCardId(card.id);
    setCurrentScreen('add');
  };

  const deleteCard = (id) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(c => c.id !== id));
            // If we were studying this card, go back to home
            if (currentScreen === 'study') {
              setCurrentScreen('home');
            }
            Alert.alert('Deleted', 'Card removed.');
          }
        },
      ]
    );
  };

  const goToStudy = (index) => {
    setCurrentCardIndex(index);
    setShowAnswer(false);
    setCurrentScreen('study');
  };

  const goNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const goPrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  // ──────────────── Home Screen ────────────────
  if (currentScreen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>My Flashcards</Text>
        <Text style={styles.count}>Total cards: {cards.length}</Text>

        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.cardRow}>
              <TouchableOpacity 
                style={styles.cardPreview}
                onPress={() => goToStudy(index)}
              >
                <Text style={styles.questionText} numberOfLines={2}>
                  {item.question}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => startEdit(item)}
                >
                  <Ionicons name="pencil" size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => deleteCard(item.id)}
                >
                  <Ionicons name="trash" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No cards yet — add your first one!</Text>
          }
        />

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            setNewQuestion('');
            setNewAnswer('');
            setEditingCardId(null);
            setCurrentScreen('add');
          }}
        >
          <Ionicons name="add-circle" size={60} color="white" />
        </TouchableOpacity>
      {/* Shuffle button - placed between list and floating add button */}
        <TouchableOpacity 
          style={styles.shuffleButton}
          onPress={() => {
            const shuffled = [...cards].sort(() => Math.random() - 0.5);
            setCards(shuffled);
          }}
        >
          <Ionicons name="shuffle" size={24} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            Shuffle Cards
          </Text>
        </TouchableOpacity></SafeAreaView>
    );
  }

  // ──────────────── Add / Edit Screen ────────────────
  if (currentScreen === 'add') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
            <Text style={styles.title}>
              {editingCardId ? 'Edit Card' : 'Add New Card'}
            </Text>

            <Text style={styles.label}>Question</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter question..."
              value={newQuestion}
              onChangeText={setNewQuestion}
              multiline
              numberOfLines={3}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Answer</Text>
            <TextInput
              style={[styles.input, { height: 140 }]}
              placeholder="Enter answer..."
              value={newAnswer}
              onChangeText={setNewAnswer}
              multiline
              numberOfLines={6}
              placeholderTextColor="#aaa"
            />

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveCard}
            >
              <Text style={styles.saveButtonText}>
                {editingCardId ? 'Update Card' : 'Save New Card'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setEditingCardId(null);
                setCurrentScreen('home');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ──────────────── Study Screen ────────────────
  const currentCard = cards[currentCardIndex] || { question: '', answer: '' };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Study Mode</Text>
      <Text style={styles.count}>
        Card {currentCardIndex + 1} / {cards.length}
      </Text>

      <TouchableOpacity 
        style={styles.studyCard}
        activeOpacity={0.8}
        onPress={() => setShowAnswer(!showAnswer)}
      >
        <Text style={styles.mainText}>
          {showAnswer ? currentCard.answer : currentCard.question}
        </Text>
        <Text style={styles.hintText}>
          {showAnswer ? '(tap to hide answer)' : '(tap anywhere to reveal answer)'}
        </Text>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity 
          style={[styles.navButton, currentCardIndex === 0 && styles.disabled]}
          disabled={currentCardIndex === 0}
          onPress={goPrevious}
        >
          <Text style={styles.navText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentCardIndex === cards.length - 1 && styles.disabled]}
          disabled={currentCardIndex === cards.length - 1}
          onPress={goNext}
        >
          <Text style={styles.navText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backText}>Back to My Cards</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
shuffleButton: {
    backgroundColor: '#ffc107',   // nice yellow/orange
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 80,             // creates space above the floating + button
    alignSelf: 'center',          // centers it horizontally
    width: '80%',                 // optional: makes it wider than default
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a3c5e',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  count: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardPreview: {
    flex: 1,
  },
  questionText: {
    fontSize: 17,
    color: '#222',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 120,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Add/Edit
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // Study
  studyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 36,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  mainText: {
    fontSize: 26,
    fontWeight: '500',
    color: '#111',
    textAlign: 'center',
    lineHeight: 38,
  },
  hintText: {
    marginTop: 24,
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  navButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#9bb8ff',
    opacity: 0.7,
  },
  navText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
// ── New icon styles ──
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 10,
    marginLeft: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: '#28a745',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },});