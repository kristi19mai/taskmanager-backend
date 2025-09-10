const createUserPayload=(user)=>{
  return {name:user.name,userId:user._id,role:user.role}
}

export default createUserPayload