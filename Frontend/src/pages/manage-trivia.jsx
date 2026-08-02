import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ManageTrivia() {
  const [adminToken, setAdminToken] = useState(undefined);
  const navigate = useNavigate();
  useEffect(() => {
    const {token} = useParams();
    if(token)
      setAdminToken(token);
    else
      navigate('/home');

    // retrieve the trivia from the backend
    
  }, []);
  


  return null;
}