import {create} from 'zustand';

const useUserEmailStore = create(set => ({
  userEmail: '',
  setUserEmail: (userEmail) => set(() => ({ userEmail })),
}))
export default useUserEmailStore;