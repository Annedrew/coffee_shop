import { create } from 'zustand';
import { produce } from 'immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CoffeeData from '../data/CoffeeData';
import BeansData from '../data/BeansData';

export const useStore = create(
    persist(
        (set, get) => ({
            CoffeeList: CoffeeData,
            BeanList: BeansData,
            CartPrise: 0,
            FavoritesList: [],
            CartList: [],
            OrderHistoryList: [],
            addToCart: (cartItem: any) =>
                set(
                    produce(state => {
                        const cartItemIndex = state.CartList.findIndex((item: any) => item.id === cartItem.id);
                        if (cartItemIndex !== -1) {
                            const cartItemPriceIndex = state.CartList[cartItemIndex].prices.findIndex((price: any) => price.size === cartItem.prices.size);
                            if (cartItemPriceIndex !== -1) {
                                state.CartList[cartItemIndex].prices[cartItemPriceIndex].quantity++;
                            } else {
                                state.CartList[cartItemIndex].prices.push(cartItem.prices[0]);
                            }
                            state.CartList[cartItemIndex].prices.sort((a: any, b: any) => b.size.localeCompare(a.size));
                        } else {
                            state.CartList.push(cartItem);
                        }
                    }
                    )
                ),
            calculateCartPrice: () =>
                set(
                    produce(state => {
                        let totalprice = 0;

                        state.CartList.forEach((item: any) => {
                            let itemPrice = 0;
                            item.prices.forEach((price: any) => {
                                itemPrice += parseFloat(price.price) * price.quantity;
                            });
                            item.itemPrice = itemPrice.toFixed(2);
                            totalprice += itemPrice;
                        })
                    }),
                ),
            addToFavoriteList: (type: string, id: string) =>
                set(
                    produce(state => {
                        const list = type === 'Coffee' ? state.CoffeeList : state.BeanList;
                        const itemIndex = list.findIndex((item: any) => item.id === id);
                        if (list[itemIndex].favorite === false) {
                            list[itemIndex].favorite = true;
                            state.FavoritesList.unshift(list[itemIndex]);
                        } else {
                            list[itemIndex].favorite = false;
                        }
                    }),
                ),
            deleteFromFavoriteList: (type: string, id: string) =>
                set(
                    produce(state => {
                        const list = type === 'Coffee' ? state.CoffeeList : state.BeanList;
                        const itemIndex = list.findIndex((item: any) => item.id === id);
                        if (list[itemIndex].favorite === true) {
                            list[itemIndex].favorite = false;
                            const favoriteItemIndex = state.FavoritesList.findIndex((item: any) => item.id === id);
                            state.FavoritesList.splice(favoriteItemIndex, 1);
                        } else {
                            list[itemIndex].favorite = true;
                        }
                    }),
                ),
        }),
        {
            name: 'coffee-app',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);