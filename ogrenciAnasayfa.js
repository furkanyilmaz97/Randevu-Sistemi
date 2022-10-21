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

function fetchData() {
  faculties_reference.get().then(function(snapshot) {
    let titles = snapshot.data().titles
    updateFacultyTitles(titles)
    users_reference.doc(signedUserId).get().then(function(document) {
      let documentData = document.data()
      if (documentData.appointments.length > 0) {
        updateAppointments(documentData.appointments)
      }
    }).catch(function(error) {
      alert(error)
    })
  }).catch(function(error) {
    alert(error)
  })
}

function fetchInstructors() {
    var selection = document.getElementById("titleList");
    var selectedIndex = selection.options[selection.selectedIndex]
    if (selectedIndex.text == "Muhendislik Fakultesi") {
        faculties_reference.collection("engineering").get().then(function(snapshot) {
          updateInstructorTitles(snapshot.docs)
        })
    } else if (selectedIndex.text == "Isletme Fakultesi") {
      faculties_reference.collection("management").get().then(function(snapshot) {
        updateInstructorTitles(snapshot.docs)
      })
    } else if (selectedIndex.text == "Mimarlik Fakultesi") {
      faculties_reference.collection("social_science").get().then(function(snapshot) {
        updateInstructorTitles(snapshot.docs)
      })
    } else {
      updateInstructorTitles([])
    }
}

function fetchOfficeHours() {
  var arrOptions = []
  var selection = document.getElementById("instructorList");
  var selectedIndex = selection.options[selection.selectedIndex]
  var facultySelection = document.getElementById("titleList");
  var facultyTitleSelectedIndex = facultySelection.options[facultySelection.selectedIndex]
  if (facultyTitleSelectedIndex.text == "Muhendislik Fakultesi") {
    faculties_reference.collection("engineering").doc(selectedIndex.value).get().then(function(document) {
       var documentData = document.data()
       var officeHours = documentData.office_hours
       officeHours.forEach(hour => {
        arrOptions.push(new Date(hour.seconds*1000))
       })
       updateOfficeHours(arrOptions)
    })
  } else if (facultyTitleSelectedIndex.text == "Isletme Fakultesi") {
    faculties_reference.collection("management").doc(selectedIndex.value).get().then(function(document) {
      var documentData = document.data()
      var officeHours = documentData.office_hours
      officeHours.forEach(hour => {
       arrOptions.push(new Date(hour.seconds*1000))
      })
      updateOfficeHours(arrOptions)
   })
  } else if (facultyTitleSelectedIndex.text == "Mimarlik Fakultesi") {
    faculties_reference.collection("social_science").doc(selectedIndex.value).get().then(function(document) {
      var documentData = document.data()
      var officeHours = documentData.office_hours
      officeHours.forEach(hour => {
       arrOptions.push(new Date(hour.seconds*1000))
      })
      updateOfficeHours(arrOptions)
   })
  }
}

function cancelAppointment(uuid) {
  var instructorSelection = document.getElementById("instructorList");
  var instructorSelectedIndex = instructorSelection.options[instructorSelection.selectedIndex]
  var cancelledInstuctor = ""
  users_reference.doc(signedUserId).get().then(function(user) {
    var userData = user.data()
    var arrOptions = []
    userData.appointments.forEach(appointment => {
        if(appointment.uuid != uuid) {
          arrOptions.push(appointment)
        } else {
          appointment.isApproved = 'cancelled'
          cancelledInstuctor = appointment.instructor
          arrOptions.push(appointment)
        }
    })
    userData.appointments = arrOptions
    users_reference.doc(signedUserId).set(userData).then(function(response) {
      users_reference.get().then(function(snapshot) {
        snapshot.forEach(doc => {
          var documentData = doc.data()
          if ((documentData.first_name + " " + documentData.last_name) == cancelledInstuctor) {
            var arropt = []
            documentData.appointments.forEach(element => {
              console.log("ELEMENT " + element)
              console.log("uuid " + uuid)
              if (element.uuid == uuid) {
                element.isApproved = 'cancelled'
                arropt.push(element)
              }else {
                arropt.push(element)
              }
            })
            documentData.appointments = arropt
            users_reference.doc(doc.id).set(documentData).then(response => {
              document.location.reload(true)
            }).catch(function(error) {
              alert(error)
            })
          }
        })
      })
    })
  })
}

function takeAppointment() {
  var instructorSelection = document.getElementById("instructorList");
  var instructorSelectedIndex = instructorSelection.options[instructorSelection.selectedIndex]

  var officeHourSelection = document.getElementById("officeHoursList");
  var officeHourSelectedIndex = officeHourSelection.options[officeHourSelection.selectedIndex]
  let uuid = uuidv4()

  users_reference.doc(signedUserId).get().then(function(user) {
    var userData = user.data()
    if (userData.appointments == undefined) {
      userData.appointments = [{
        appointmentDate: officeHourSelectedIndex.text,
        instructor: instructorSelectedIndex.text,
        isApproved: "pending",
        uuid: uuid
      }]
      users_reference.doc(signedUserId).set(userData).then(function(response) {
        document.location.reload(true)
      }).catch(function(error) {
        alert(error)
      })
    }else {
      userData.appointments.push({
        appointmentDate: officeHourSelectedIndex.text,
        instructor: instructorSelectedIndex.text,
        isApproved: "pending",
        uuid: uuid
      })
      users_reference.doc(signedUserId).set(userData).then(function(response) {
        users_reference.get().then(function(snapshot) {
          snapshot.forEach(doc => {
            let documentData = doc.data()
            console.log(documentData.first_name + " " + documentData.last_name == instructorSelectedIndex.text)
            if (documentData.first_name + " " + documentData.last_name == instructorSelectedIndex.text) {
              console.log(documentData.first_name + " " + documentData.last_name)
              documentData.appointments.push({
                appointmentDate: officeHourSelectedIndex.text,
                student: userData.email,
                isApproved: "pending",
                uuid: uuid
              })
              users_reference.doc(doc.id).set(documentData).then(response => {
                document.location.reload(true)
              }).catch(function(error) {
                alert(error)
              })
            }
          })
        })
      }).catch(function(error) {
        alert(error)
      })
    }
  }).catch(function(error) {
    alert(error)
  })
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

console.log(uuidv4());

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function updateOfficeHours(hours) {
  var arrOptions = [];
  arrOptions.push("<option selected='selected'>Saat Seciniz</option>" )
  if (hours.length == 0) {
    document.getElementById("officeHoursList").innerHTML = arrOptions.join();
  } else {
    hours.forEach(hour => {
      arrOptions.push("<option value='"+ hour+"'" + formatDate(hour) +"'>"+ formatDate(hour) +"</option>" )
     });
     document.getElementById("officeHoursList").innerHTML = arrOptions.join();
  }
}

function updateAppointments(appointments) {
  var arrOptions = []
  if (appointments.length == 0) {
    document.getElementById("appointmentsList").innerHTML = arrOptions.join();
  } else {
    appointments.forEach(appointment => {
      if(appointment.isApproved == "accepted") {
        arrOptions.push("<div><p style='color:green'>"+ appointment.appointmentDate +"</p><p style='color:green'>"+ appointment.instructor +"</p><br><input style= width:100%; text-align: justify;  type='button' onClick= cancelAppointment('"+ appointment.uuid +"') value='İptal Et'></div>" )
      } else if (appointment.isApproved == "pending") {
        arrOptions.push("<div><p style='color:yellow'>"+ appointment.appointmentDate +"</p><p style='color:yellow'>"+ appointment.instructor +"</p><br><input style= width:100%; text-align: justify;  type='button' onClick= cancelAppointment('"+ appointment.uuid +"') value='İptal Et'></div>" )
      } else if (appointment.isApproved == "rejected") {
        arrOptions.push("<div><p style='color:red'>"+ appointment.appointmentDate +"</p><p style='color:red'>"+ appointment.instructor +"</p><br></div>" )
      } else {
        arrOptions.push("<div><p style='color:black'>"+ appointment.appointmentDate +"</p><p style='color:black'>"+ appointment.instructor +"</p><br></div>" )
      }
     });
     document.getElementById("appointmentsList").innerHTML = arrOptions.join();
  }
}

function updateInstructorTitles(instructors) {
  var arrOptions = [];
  arrOptions.push("<option selected='selected'>Egitmen Seciniz</option>" )
  if (instructors.length == 0) {
    document.getElementById("instructorList").innerHTML = arrOptions.join();
  } else {
    instructors.forEach(instructor => {
      var instructorData = instructor.data()
      arrOptions.push("<option value="+ instructor.id +" " + instructorData.first_name + " " + instructorData.last_name +"'>"+ instructorData.first_name + " " +instructorData.last_name +"</option>" )
     });
     document.getElementById("instructorList").innerHTML = arrOptions.join();
  }
}

function updateFacultyTitles(titles) {
  var arrOptions = [];
  arrOptions.push("<option selected='selected'>Fakulte Seciniz</option>" )
  titles.forEach(title => {
   arrOptions.push("<option value='" + title +"'>"+ title +"</option>" )
  });
  document.getElementById("titleList").innerHTML = arrOptions.join();
}