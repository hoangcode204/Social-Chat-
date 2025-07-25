import {TOKEN} from "../../config/Config";
import {useDispatch, useSelector} from "react-redux";
import {AuthReducerState, LoginRequestDTO} from "../../redux/auth/AuthModel";
import {useNavigate} from "react-router-dom";
import React, {Dispatch, useEffect, useState} from "react";
import {currentUser, loginUser} from "../../redux/auth/AuthAction";
import {RootState} from "../../redux/Store";
import {Button, TextField} from "@mui/material";
import styles from "./Register.module.scss";


// TODO: Show error if something went wrong (like wrong mail/ pw)
const SignIn = () => {

    const [signInData, setSignInData] = useState<LoginRequestDTO>({email: "", password: ""});
    const navigate = useNavigate();//chuyển hướng đến trang khác
    const dispatch: Dispatch<any> = useDispatch();// gọi hàm dispatch để gửi action đến Redux
    //Xử lí gọi action đăng nhập
    const token: string | null = localStorage.getItem(TOKEN);
    const state: AuthReducerState = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        //Kiểm tra nếu đã có token, thì gọi currentUser:
        if (token) {
            dispatch(currentUser(token));
        }
    }, [token, state.reqUser, dispatch]);

    useEffect(() => {
        // Sau khi đăng nhập thành công, chuyển user về trang chính.
        if (state.reqUser) {
            navigate("/");
        }
    }, [state, navigate]);

    const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        // Gửi signInData (email + password) đến Redux để xử lý đăng nhập.
        e.preventDefault();
        console.log("Sign in form submitted");
        dispatch(loginUser(signInData));
    };
    // Xử lý sự kiện khi người dùng nhập email vào ô input.
    const onChangeEmail = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSignInData({...signInData, email: e.target.value});
    };
    // Xử lý sự kiện khi người dùng nhập password vào ô input.
    const onChangePassword = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSignInData({...signInData, password: e.target.value});
    };
    //Chuyển hướng đến trang đăng ký tài khoản mới.
    const onClickCreateNewAccount = (e: any) => {
        navigate("/signup");
    };

    return (
        <div>
            <div className={styles.outerContainer}>
                <div className={styles.innerContainer}>
                    <form onSubmit={onSubmit}>
                        <div>
                            <p className={styles.text}>Email</p>
                            <TextField
                                className={styles.textInput}
                                id="email"
                                type="email"
                                label="Enter your email"
                                variant="outlined"
                                onChange={onChangeEmail}
                                value={signInData.email}/>
                        </div>
                        <div>
                            <p className={styles.text}>Password</p>
                            <TextField
                                className={styles.textInput}
                                id="password"
                                type="password"
                                label="Enter your password"
                                variant="outlined"
                                onChange={onChangePassword}
                                value={signInData.password}/>
                        </div>
                        <div className={styles.button}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                type="submit">
                                Sign in
                            </Button>
                        </div>
                    </form>
                    <div className={styles.bottomContainer}>
                        <p>Create new account</p>
                        <Button variant='text' size='large' onClick={onClickCreateNewAccount}>Signup</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
