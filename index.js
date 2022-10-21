// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBVEfB4IpUI0J68ImWfZg2kHzVrnmWWx-A",
    authDomain: "web-login-a3248.firebaseapp.com",
    projectId: "web-login-a3248",
    storageBucket: "web-login-a3248.appspot.com",
    messagingSenderId: "290466797466",
    appId: "1:290466797466:web:5ff8a77f43ede40579cc23"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Initialize variables
  const auth = firebase.auth()
  const database = firebase.database()
  const firestore = firebase.firestore()
  
  const users_reference = firestore.collection("users/")

  // login fonsiyonu
  function login () {
    // inputları alma
    email = document.getElementById('email').value
    password = document.getElementById('password').value
  
    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('Email veya Parola Hatalı')
      return
      // Don't continue running the code
    } else {
        auth.signInWithEmailAndPassword(email, password).then(function() {
          var user = auth.currentUser
          var user_ref = users_reference.doc(user.uid)
          var user_data = {
            last_login : {
              seconds: Date.now(),
              nanoseconds: 0
            }
          }

          user_ref.update(user_data).then(function() {
            alert("Giriş Başarılı.")
            if (find_account_role(email) == 0 ) {
              localStorage.setItem("signedUserId", user.uid)
              window.location.href = "ogrenciAnasayfa.html";
            } else {
              localStorage.setItem("signedUserId", user.uid)
              window.location.href = "akademisyenAnasayfa.html";
            }
          }).catch(function(error) {
            var error_code = error.code
            var error_message = error.message
            alert(error_message)
          })

        })
    }
  }

  function deleteStudent() {
    email = document.getElementById('email-delete').value
    users_reference.get().then(function(snapshot) {
      snapshot.forEach(document => {
        if (document.data().email == email) {
          users_reference.doc(document.id).delete().then(function(response) {
            auth.deleteUser(document.id)
            .then(() => {
              alert("Kullanici Sistemden Kaldirildi")
              document.location.reload(true)
            })
            .catch((error) => {
              console.log('Error deleting user:', error);
            });
          })
        }
      })
    })
  }
  

  function signup() {
    // Verileri Kullanıcılardan Toplama
    email = document.getElementById('email-sign-up').value
    password = document.getElementById('password-sign-up').value
    namesignup = document.getElementById('name-sign-up').value
    surname = document.getElementById('surname-sign-up').value

    // Verilerin Validation İşlemi
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('Email veya Parola Hatalı')
      return
    } else {
      auth.createUserWithEmailAndPassword(email, password).then(function(userCredential) {
        var user = userCredential.user
        var user_ref = users_reference.doc(user.uid)
        var user_data = {
          created_at : {
            seconds: Date.now(),
            nanoseconds: 0
          },
          appointments: []
        }
        user_ref.set(user_data).then(function() {
          alert("Kayıt Başarılı.")
          var signin_data = {
            last_login : {
              seconds: Date.now(),
              nanoseconds: 0
            },
            email: email,
            first_name: namesignup,
            last_name: surname
          }

          user_ref.update(signin_data).then(function() {
            if (find_account_role(email) == 0 ) {
              window.location.href = "ogrenciAnasayfa.html";
            } else {
              window.location.href = "akademisyenAnasayfa.html";
            }
          }).catch(function(error) {
            var error_code = error.code
            var error_message = error.message
            alert(error_message)
          })
        }).catch(function(error) {
          var error_code = error.code
          var error_message = error.message
      
          alert(error_message)
        })

      })
    }

  }
  

  function find_account_role(email) {
    if (email.includes("@isik.edu.tr")) {
      return 0
    } else if (email.includes("@isikun.edu.tr")) {
      return 1
    }
  }
  
  
  // Validate Functions
  function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
      if (email.includes("@isik.edu.tr")) {
        return true
      } else if (email.includes("@isikun.edu.tr")) {
        return true
      }else {
        return false
      }
    } else {
      return false
    }
  }
  
  function validate_password(password) {
    
    if (password < 6) {
      return false
    } else {
      return true
    }
  }
  
 