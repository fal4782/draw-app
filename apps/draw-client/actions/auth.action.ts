import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";
export async function authAction(
  formData: FormData,
  isSignin: boolean,
  setError: (error: string) => void
) {
  const username = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (isSignin) {
    await signin(username, password, setError);
  } else {
    await signup(username, password, setError);
  }
}

async function signup(
  username: string,
  password: string,
  setError: (error: string) => void
) {
  try {
    const response = await axios.post(`${HTTP_BACKEND_URL}/signup`, {
      username,
      password,
      name: username.split("@")[0],
    });
    console.log(response.data);
  } catch (error: any) {
    setError(error.response.data.error);
  }
}

async function signin(
  username: string,
  password: string,
  setError: (error: string) => void
) {
  try {
    const response = await axios.post(`${HTTP_BACKEND_URL}/signin`, {
      username,
      password,
    });
    localStorage.setItem("token", response.data.token);
    console.log(response.data);
  } catch (error: any) {
    setError(error.response.data.error);
  }
}
