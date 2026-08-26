import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";
import Console from "../utils/console";
import { BASE_URL } from "../config";

function UserLogin() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const getErrorMessage = (error) => {
    const responseData = error?.response?.data;

    if (Array.isArray(responseData) && responseData[0]?.msg) {
      return responseData[0].msg;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors[0]?.msg) {
      return responseData.errors[0].msg;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    return "No se pudo iniciar sesión";
  };

  const loginUser = async (data) => {
    if (data.email.trim() !== "" && data.password.trim() !== "") {
      try {
        setLoading(true);
        const response = await axios.post(
          `${BASE_URL}/user/login`,
          data
        );
        Console.log(response);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify({
          type: "user",
          data: response.data.user,
        }));
        navigation("/home");
      } catch (error) {
        setResponseError(getErrorMessage(error));
        Console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setResponseError("");
    }, 5000);
  }, [responseError]);
  return (
    <div className="w-full h-dvh flex flex-col justify-between p-4 pt-6">
      <div>
        <Heading title={"Iniciar sesión 👤"} />
        <form onSubmit={handleSubmit(loginUser)}>
          <Input
            label={"Correo"}
            type={"email"}
            name={"email"}
            register={register}
            error={errors.email}
          />
          <Input
            label={"Contraseña"}
            type={"password"}
            name={"password"}
            register={register}
            error={errors.password}
          />
          {responseError && (
            <p className="text-sm text-center mb-4 text-red-500">
              {responseError}
            </p>
          )}
          <Link to="/user/forgot-password" className="text-sm mb-2 inline-block">
            ¿Olvidó su contraseña?
          </Link>
          <Button title={"Iniciar sesión"} loading={loading} type="submit" />
        </form>
        <p className="text-sm font-normal text-center mt-4">
          ¿Aún no tiene cuenta?{" "}
          <Link to={"/signup"} className="font-semibold">
            Registrarse
          </Link>
        </p>

      </div>
      <div>
        <Button
          type={"link"}
          path={"/captain/login"}
          title={"Iniciar sesión como conductor"}
          classes={"bg-orange-500"}
        />
        <p className="text-xs font-normal text-center self-end mt-6">
          La búsqueda de ubicación utiliza datos de OpenStreetMap y servicios de enrutamiento.
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
