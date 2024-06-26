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
            CartPrice: 0,
            FavoritesList: [],
            CartList: [],
            OrderHistoryList: [],
            clearCart: () => set({ CartList: [] }),
            addToCart: (cartItem: any) => 
                set(
                    produce((state) => {
                        const cartItemIndex = state.CartList.findIndex((item: any) => item.id === cartItem.id);
                        if (cartItemIndex !== -1) {
                            const existingItem = state.CartList[cartItemIndex]
                            const existingItemPrices = existingItem.prices;
                            const cartItemPriceIndex = existingItemPrices.findIndex((price: any) => price.size === cartItem.prices[0].size);
                            if (cartItemPriceIndex !== -1) {
                                existingItem.prices[cartItemPriceIndex].quantity++;
                            } else {
                                existingItem.prices.push({...cartItem.prices[0], quantity: 1});
                            }
                            existingItem.prices.sort((a: any, b: any) => b.size.localeCompare(a.size));
                        } else {
                            state.CartList.push(cartItem);
                        }
                    })
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
                        
                        state.CartPrice = totalprice.toFixed(2).toString();
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
            incrementCartItemQuantity: (id: string, size: string) =>
                set(
                    produce(state => {
                        const itemIndex = state.CartList.findIndex((item: any) => item.id === id);
                        const itemSizeIndex = state.CartList[itemIndex].prices.findIndex((price: any) => price.size === size);
                        if (itemIndex != -1 && itemSizeIndex != -1) {
                            state.CartList[itemIndex].prices[itemSizeIndex].quantity++;
                        }
                    }),
                ),
            decrementCartItemQuantity: (id: string, size: string) =>
                set(
                    produce(state => {
                        const itemIndex = state.CartList.findIndex((item: any) => item.id === id);
                        const itemSizeIndex = state.CartList[itemIndex].prices.findIndex((price: any) => price.size === size);
                        if (itemIndex != -1 && itemSizeIndex != -1) {
                            if (state.CartList[itemIndex].prices.length > 1) {
                                if (state.CartList[itemIndex].prices[itemSizeIndex].quantity > 1) {
                                    state.CartList[itemIndex].prices[itemSizeIndex].quantity--;
                                } else {
                                    state.CartList[itemIndex].prices.splice(itemSizeIndex, 1);
                                }
                            } else {
                                if (state.CartList[itemIndex].prices[itemSizeIndex].quantity > 1) {
                                    state.CartList[itemIndex].prices[itemSizeIndex].quantity--;
                                } else {
                                    state.CartList.splice(itemIndex, 1);
                                }
                            }
                        }
                    }),
                ),
            addToOrderHistoryListFromCart: () =>
                set(
                    produce(state => {
                        let temp = state.CartList.reduce(
                            (accumulator: number, currentValue: any) => 
                                accumulator + parseFloat(currentValue.itemPrice),
                            0,
                        );
                        if (state.OrderHistoryList.length > 0) {
                            state.OrderHistoryList.unshift({
                                OrderDate:
                                    new Date().toDateString() +
                                    ' ' +
                                    new Date().toLocaleTimeString(),
                                CartList: state.CartList,
                                CartListPrice: temp.toFixed(2),
                            });
                        } else {
                            state.OrderHistoryList.push({
                                OrderDate:
                                    new Date().toDateString() +
                                    ' ' +
                                    new Date().toLocaleTimeString(),
                                CartList: state.CartList,
                                CartListPrice: temp.toFixed(2),
                            });
                        }
                        state.CartList = [];
                    }),
                ),
        }),
        {
            name: 'coffee-app',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);