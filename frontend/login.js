function myFunction(){
    var x = document.getElementById("login");
    var userId=x.userId.value;
    var userPassword=x.userPassword.value;
    console.log(userId)
    const Url='http://localhost:8081/user/sign-in'
    const Data={
      userId:userId,
      userPassword:userPassword,
    }

    const othePram={
      headers: {
        'content-type': 'application/json',
        //'Authorization': "Bearer "+token
      },
      body: JSON.stringify({
        userId: userId,
        userPassword: userPassword,
      }),
      method: 'POST',
    }
    console.log(othePram)
    fetch(Url, othePram)
    .then((data)=>{return data.json()})
    .then((res)=>{console.log(res)//location.href='test.html'
    // if(res.code.status==1200){
    //   location.href='test.html'
    // }
  })
    .catch((error)=>console.log(error))
  }