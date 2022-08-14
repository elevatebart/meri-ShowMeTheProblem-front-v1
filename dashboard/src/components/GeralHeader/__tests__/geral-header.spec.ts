import GeralHeader from '@/components/GeralHeader.vue'
import PartModal from '@/components/Modal/index.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createStore } from 'vuex'

describe('GeralHeader', () => {
    let wrapper: VueWrapper

    const store = createStore({
        state() {
            return {
                users: [],
            }
        },
        mutations: {
            REGISTER_USER() {
                return
            },
        },
    })

    beforeAll(() => {
        wrapper = mount(GeralHeader, {
            attachTo: document.body,
            global: {
                plugins: [store],
                components: {
                    PartModal,
                },
            },
        })
    })

    afterEach(() => {
        wrapper.unmount()
        document.body.outerHTML = ''
    })

    //Testes de Unidade:
    describe('Unidade', () => {
        test('Dado o preenchimento do formulário para criar conta quando clicar em "Criar conta" deve criar um usuário e retornar uma notificação', async () => {
            // Simular execuçao de createUser() com dados mock
        })
    })

    describe('Componente', () => {
        describe('Renderização', () => {
            test('Dado o componente quando for montado deve ser uma instancia vue', () => {
                expect(wrapper.vm).toBeDefined()
            })
        })
        describe('Comportamento', () => {
            test('Dado que o usuário precisa criar uma conta quando clicar em "Crie uma conta" então deve exibir um modal', async () => {
                await wrapper.get('[data-create]').trigger('click')

                expect(wrapper.emitted().click).toBeTruthy()
                expect(wrapper.findComponent(PartModal)).toBeTruthy()
            })

            test('Dado que o usuário precisa efetuar login quando clicar em "Entrar" então deve exibir um modal', async () => {
                await wrapper.get('[data-login]').trigger('click')

                expect(wrapper.emitted().click).toBeTruthy()
                expect(wrapper.findComponent(PartModal)).toBeTruthy()
            })
        })
        describe('Navegação', () => {
            it('deveria abrir a rota "Credentials" ao efetuar login', () => {
                return
            })
        })
    })
})
