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
  const academic_reference = firestore.collection("academic/")
  const faculties_reference = academic_reference.doc("faculties")
  const signedUserId = localStorage.getItem("signedUserId")


  function fetchPendingAppointments() {
    users_reference.doc(signedUserId).get().then(function(document) {
        let documentData = document.data()
        if (documentData.appointments.length > 0) {
            updatePendingAppointments(documentData.appointments)
        }
    }).catch(function(error){
        alert(error)
    })
  }

  function approveAppointment(uuid) {
    users_reference.doc(signedUserId).get().then(function(doc) {
        var documentData = doc.data()
        var arrOptions = []
        var studentMail = ""
        documentData.appointments.forEach(app => {
            if (app.uuid == uuid) {
                app.isApproved = "approved"
                studentMail = app.student
                arrOptions.push(app)
            } else {
                arrOptions.push(app)
            }
        });
        documentData.appointments = arrOptions
        users_reference.doc(signedUserId).set(documentData).then(function(response) {
            users_reference.get().then(function(snapshot) {
                snapshot.forEach(doc2 => {
                    var data2 = doc2.data()
                    console.log(data2.email)
                    console.log(studentMail)
                    if (data2.email == studentMail) {
                        var appointments2 = data2.appointments
                        var studentArrOptions = []
                        appointments2.forEach(studentApp => {
                            if(studentApp.uuid == uuid) {
                                studentApp.isApproved = 'approved'
                                studentArrOptions.push(studentApp)
                            } else { studentArrOptions.push(studentApp) }
                        })
                        data2.appointments = studentArrOptions
                        users_reference.doc(doc2.id).set(data2).then(function() {
                            document.location.reload(true)
                        })
                    }
                })
            })
        }).catch(function(error) {
            alert(error)
        })
    }).catch(function(error) {
        alert(error)
    })
  }

  function rejectAppointment(uuid) {
    users_reference.doc(signedUserId).get().then(function(doc) {
        var documentData = doc.data()
        var arrOptions = []
        var studentMail = ""
        documentData.appointments.forEach(app => {
            if (app.uuid == uuid) {
                app.isApproved = "rejected"
                studentMail = app.student
                arrOptions.push(app)
            } else {
                arrOptions.push(app)
            }
        });
        documentData.appointments = arrOptions
        users_reference.doc(signedUserId).set(documentData).then(function(response) {
            users_reference.get().then(function(snapshot) {
                snapshot.forEach(doc2 => {
                    var data2 = doc2.data()
                    if (data2.email == studentMail) {
                        var appointments = data2.appointments
                        var studentArrOptions = []
                        appointments.forEach(studentApp => {
                            if(studentApp.uuid == uuid) {
                                studentApp.isApproved = 'rejected'
                                studentArrOptions.push(studentApp)
                            } else { studentArrOptions.push(studentApp) }
                        })
                        data2.appointments = studentArrOptions
                        users_reference.doc(doc2.id).set(data2).then(function() {
                            document.location.reload(true)
                        })
                    }
                })
            })
        }).catch(function(error) {
            alert(error)
        })
    }).catch(function(error) {
        alert(error)
    })
  }

  function updatePendingAppointments(appointments) {
    var arrOptions = [];
    if (appointments.length == 0) {
      document.getElementById("pendingAppointmentsTable").innerHTML = arrOptions.join();
    } else {
      appointments.forEach(appointment => {
        console.log(appointment.isApproved)
        if (appointment.isApproved == 'approved') {
            arrOptions.push("<tr><td style='width:100%; color:green; text-align: justify;'>"+ appointment.student +"</td><td style= 'width:100%; color:green; text-align: justify;'>"+ appointment.appointmentDate +"</td><td style= width:100%; text-align: justify; ><input style= width:100%; text-align: justify;  type='button' onClick= approveAppointment('"+ appointment.uuid +"') value='Onayla'><input style= width:100%; text-align: justify; type='button' onClick= rejectAppointment('"+ appointment.uuid +"') value='Reddet'></td></tr>")
        } else if (appointment.isApproved == 'rejected') {
            arrOptions.push ("<tr><td style='width:100%; color:red; text-align: justify;'>"+ appointment.student +"</td><td style= 'width:100%; color:red; text-align: justify;'>"+ appointment.appointmentDate +"</td><td style= width:100%; text-align: justify; ><input style= width:100%; text-align: justify;  type='button' onClick= approveAppointment('"+ appointment.uuid +"') value='Onayla'><input style= width:100%; text-align: justify;  type='button' onClick= rejectAppointment('"+ appointment.uuid +"') value='Reddet'></td></tr>")
        } else if (appointment.isApproved == 'cancelled') {
            arrOptions.push ("<tr><td style= 'width:100%; color:gray; text-align: justify;'>"+ appointment.student +"</td><td style= 'width:100%; color:gray; text-align: justify;'>"+ appointment.appointmentDate +"</td><td style= width:100%; text-align: justify; ></td></tr>")
        } else if (appointment.isApproved == 'pending') {
            arrOptions.push ("<tr><td style= 'width:100%; color:yellow; text-align: justify;'>"+ appointment.student +"</td><td style= 'width:100%; color:yellow; text-align: justify;'>"+ appointment.appointmentDate +"</td><td style= width:100%; text-align: justify; ><input style= width:100%; text-align: justify;  type='button' onClick= approveAppointment('"+ appointment.uuid +"') value='Onayla'><input style= width:100%; text-align: justify;  type='button' onClick= rejectAppointment('"+ appointment.uuid +"') value='Reddet'></td></tr>")
        }
       });
       document.getElementById("pendingAppointmentsTable").innerHTML = arrOptions.join();
    }
  }