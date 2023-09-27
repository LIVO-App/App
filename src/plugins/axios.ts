import axios from 'axios'
/*import type {App} from 'vue'

interface AxiosOptions {
    baseUrl?: string
    token?: string
}

export default {
    install: (app: App, options: AxiosOptions) => {
        app.config.globalProperties.$axios = axios.create({ //inject not working
            baseURL: options.baseUrl,
            headers: {
                Authorization: options.token ? `Bearer ${options.token}` : '',
            }
        })
    }
}*/

const options: {
    baseUrl?: string
    token?: string
} = {
    baseUrl: "https://backend.livopath.istitutodecarneri.it", // Da sistemare: sfruttare --prod per alternare lui a "http://localhost:5000/api"
    token: sessionStorage.getItem("token") ?? undefined
};

const $axios = axios.create({
    baseURL: options.baseUrl,
    headers: {
        //Authorization: options.token ? `Bearer ${options.token}` : '',
        "x-access-token": options.token ?? undefined,
    }
});

export { $axios }