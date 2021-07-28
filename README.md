##### Users endpoints

###### Signup

`
POST /users/signup -d {username, email password, [avatar]} return success or failure reason
`
---

###### Login

`POST /users/login -d {username, password}
`

- Successful
    - return accessToken and refreshToken
- Failed
    - return reason

###### Logout

`POST /users/logout -d {refreshToken}`
`return OK`