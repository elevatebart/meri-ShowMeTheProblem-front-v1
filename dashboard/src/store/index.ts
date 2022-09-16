import useNotifier from '../hooks/notifier'
import router from '../router/index'
import { Actions } from './type-actions'
import { Mutations } from './type-mutations'
import { IEstadoStore, IUser, INotification, TypeOfNotification } from '@/interfaces'
import callApiClient from '@/services/callApiClient'
import { applyFiltersStructure } from '@/views/Feedbacks/module'
import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'

export const key: InjectionKey<Store<IEstadoStore>> = Symbol()

const tokenTesteApi =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVhYjc1OWY4LWYyMzgtNGZmOS1hZTkxLWVlMTU1ODk4MjMyOSIsImVtYWlsIjoiaWdvckBpZ29yLm1lIiwibmFtZSI6Iklnb3IgSGFsZmVsZCIsImlhdCI6MTYxMDc0MzgyNn0.2R-hm8yCSAtpcvniI1R9CNF_ZzguRaMZoU2pTrwijds'

export const store = createStore<IEstadoStore>({
    state: {
        users: [],
        notifications: [],
        isLogged: false,
        userLogged: {
            name: '',
            token: '',
            apiKey: '',
            filters: [],
            feedbacks: [],
        },
        isLoading: false,
        hasErrors: false,
    },
    getters: {
        notifications(state) {
            return state.notifications
        },
        feedbacks(state) {
            return state.userLogged.feedbacks
        },
        feedbackFilters(state) {
            return state.userLogged.filters
        },
    },
    mutations: {
        [Mutations.NOTIFY](state, newNotification: INotification) {
            newNotification.id = new Date().getTime()
            state.notifications.push(newNotification)
            setTimeout(() => {
                state.notifications = state.notifications.filter((notif) => notif.id != newNotification.id)
            }, 5000)
        },
        [Mutations.ADD_USER](state, user: IUser) {
            state.users.push(user)
        },
        [Mutations.LOGIN_USER](state, token) {
            state.userLogged.token = token
            state.isLogged = true
        },
        [Mutations.USER_LOGGED](state, data) {
            state.userLogged.name = data.name
            state.userLogged.apiKey = data.apiKey
        },
        [Mutations.ADD_FILTERS](state, data) {
            state.userLogged.filters = applyFiltersStructure(data)
        },
        [Mutations.ADD_FEEDBACKS](state, data) {
            state.userLogged.feedbacks = data
        },
    },
    actions: {
        /**
         * @name REGISTER_USER
         * @descripton efetua o registro do usuário e o adiciona a store
         * @param {IUser} user usuário com name, email e password
         */
        async [Actions.REGISTER_USER]({ commit, state }, user: IUser) {
            const { notify } = useNotifier()
            try {
                state.isLoading = true
                if (user.name != '' && user.email != '' && user.password != '') {
                    const response = await callApiClient.user.register(user.name, user.email, user.password)
                    commit(Mutations.ADD_USER, response)
                }
                state.isLoading = false
                notify(
                    TypeOfNotification.SUCESSO,
                    'Conta Registrada',
                    'Sua conta foi criada com sucesso, efetue login.'
                )
            } catch (error) {
                state.isLoading = false
                state.hasErrors = !!error
                notify(TypeOfNotification.FALHA, 'Preencha todos os campos', 'Erro na tentativa de criar uma conta.')
                throw new Error(`Não foi possível efetuar cadastro. Confira os dados informados`)
            }
        },

        /**
         * @name LOGIN_USER
         * @description Efetua login do usuário, salva o token na store,
         * redireciona para a página de 'feedbacks' e aciona a action
         * para pegar os dados do usuário logado.
         * @param {IUser} user usuário com name, email e password
         */
        async [Actions.LOGIN_USER]({ commit, dispatch, state }, user: IUser) {
            const { notify } = useNotifier()
            try {
                state.isLoading = true
                const response = await callApiClient.user.login(user.email, user.password)
                console.log(response)

                commit(Mutations.LOGIN_USER, response.token)
                dispatch(Actions.GET_USER, state.userLogged.token)

                // if (!errors) {
                // }
                window.localStorage.setItem('token', response.token)
                router.push('/feedbacks')

                notify(TypeOfNotification.SUCESSO, '', 'Login efetuado com sucesso.')
            } catch (error) {
                state.isLoading = false
                state.hasErrors = !!error
                notify(TypeOfNotification.FALHA, 'Não foi possível efetuar login', 'Confira os dados informados.')
                throw new Error(`Não foi possível efetuar login. Confira os dados informados`)
            }
        },

        /**
         * @name GET_USER
         * @descripton Captura os dados do usuários e salva na store
         * @param token chave de acesso do usuário
         */
        async [Actions.GET_USER]({ commit }, token: string) {
            try {
                const response = await callApiClient.user.show(token)
                commit(Mutations.USER_LOGGED, response)
            } catch (e) {
                throw new Error(`Não foi possível capturar os dados do usuário.`)
            }
        },
        // Substituir o tokenTesteApi pelo token do usuario logado depois
        async [Actions.GET_INDEX_FEEDBACK]({ commit, state }) {
            try {
                const response = await callApiClient.feedback.showFilters(tokenTesteApi)
                commit(Mutations.ADD_FILTERS, response)
            } catch (error) {
                state.hasErrors = !!error
                commit(Mutations.ADD_FILTERS, { all: 0, issue: 0, idea: 0, other: 0 })
                throw new Error(`Não foi possível capturar os filtros dos feedbacks do usuário atual.`)
            }
        },

        async [Actions.GET_ALL_FEEDBACKS]({ commit, state }, { type, limit, offset }) {
            try {
                const response = await callApiClient.feedback.show(tokenTesteApi, type, limit, offset)
                // const response = await callApiClient.feedback.show(
                //     this.state.userLogged.token, type, limit, offset
                // )
                console.log(response)
                commit(Mutations.ADD_FEEDBACKS, response.results)
            } catch (error) {
                state.hasErrors = !!error
                throw new Error(`Não foi possível capturar os feedbacks do usuário.`)
            }
        },
    },
    modules: {},
})

export function useStore(): Store<IEstadoStore> {
    return baseUseStore(key)
}
