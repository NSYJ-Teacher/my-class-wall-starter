// ===================================================
// 우리 반 담벼락 - Firebase Firestore 연동 버전
//
// 메모를 쓰면 Firestore에 저장되고,
// 누군가 쓰거나 지우면 실시간으로 모든 화면이 바뀝니다.
// ===================================================

// Firebase SDK (CDN ES Module, 번들러 없이 사용)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Firebase 설정 및 초기화
const firebaseConfig = {
  apiKey: "AIzaSyCVOKFfK42ZhbUaiNUkQASwEtjcizWAziA",
  authDomain: "first-try-8dbdf.firebaseapp.com",
  projectId: "first-try-8dbdf",
  storageBucket: "first-try-8dbdf.firebasestorage.app",
  messagingSenderId: "93980797035",
  appId: "1:93980797035:web:b9f5b70673d2b8c0a4692e"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Firestore 컬렉션 참조
const memosRef = collection(db, "memos");


// ===================================================
// 데이터를 다루는 함수 세 개
// ===================================================

// 메모를 읽어 옵니다.
// onSnapshot으로 Firestore 변경사항을 실시간 감지합니다.
// 누군가 메모를 쓰거나 지우면 render()가 자동으로 불립니다.
function loadMemos() {
  const q = query(memosRef, orderBy("createdAt"));
  onSnapshot(q, function (snapshot) {
    const memos = snapshot.docs.map(function (docSnap) {
      return { id: docSnap.id, ...docSnap.data() };
    });
    render(memos);
  });
}

// 메모를 새로 씁니다.
// Firestore에 저장하면 onSnapshot이 자동으로 render()를 부릅니다.
// 백엔드 2: 여기에 "누가 썼는지"(uid)를 함께 저장하게 됩니다.
async function addMemo(text) {
  await addDoc(memosRef, {
    text: text,
    createdAt: Date.now()
  });
}

// 메모를 지웁니다.
// 백엔드 2: 지금은 누구든 남의 메모를 지울 수 있습니다. 이걸 막는 것이 과제입니다.
async function deleteMemo(id) {
  await deleteDoc(doc(db, "memos", id));
}


// ===================================================
// 화면 그리기
// ===================================================

// onSnapshot에서 받은 memos 배열을 그립니다.
function render(memos) {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  memos.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  const del = document.createElement("button");
  del.textContent = "×";
  // 삭제 후 render()는 onSnapshot이 자동으로 부릅니다.
  del.addEventListener("click", function () {
    deleteMemo(memo.id);
  });
  div.appendChild(del);

  const span = document.createElement("span");
  span.textContent = memo.text;
  div.appendChild(span);

  return div;
}


// ===================================================
// 메모 쓰는 칸
// 엔터를 누르면 담벼락에 붙습니다 (줄바꿈은 Shift + 엔터)
// ===================================================

const input = document.getElementById("input");

// 엔터를 누르면 Firestore에 저장합니다.
// 저장이 완료되면 onSnapshot이 자동으로 화면을 다시 그립니다.
input.addEventListener("keydown", async function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    await addMemo(text);
    input.value = "";
  }
});


// 실시간 리스너 시작 (Firestore에서 데이터를 가져오고 변경사항을 감지합니다)
loadMemos();
input.focus();
