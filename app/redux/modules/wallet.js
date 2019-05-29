// @flow

import type { Action } from '../../types/redux';
import type { TransactionsList } from './transactions';

// Actions
export const LOAD_WALLET_SUMMARY = 'LOAD_WALLET_SUMMARY';
export const LOAD_WALLET_SUMMARY_SUCCESS = 'LOAD_WALLET_SUMMARY_SUCCESS';
export const LOAD_WALLET_SUMMARY_ERROR = 'LOAD_WALLET_SUMMARY_ERROR';

// Actions Creators
export const loadWalletSummary: () => Action = () => ({
  type: LOAD_WALLET_SUMMARY,
  payload: {},
});

export const loadWalletSummarySuccess = ({
  total,
  shielded,
  transparent,
  unconfirmed,
  addresses,
  transactions,
  zelPrice,
}: {
  total: number,
  shielded: number,
  transparent: number,
  unconfirmed: number,
  addresses: string[],
  transactions: TransactionsList,
  zelPrice: number,
}) => ({
  type: LOAD_WALLET_SUMMARY_SUCCESS,
  payload: {
    total,
    shielded,
    transparent,
    unconfirmed,
    addresses,
    transactions,
    zelPrice,
  },
});

export const loadWalletSummaryError = ({ error }: { error: string }) => ({
  type: LOAD_WALLET_SUMMARY_ERROR,
  payload: { error },
});

export type State = {
  total: number,
  shielded: number,
  transparent: number,
  unconfirmed: number,
  error: string | null,
  isLoading: boolean,
  zelPrice: number,
  addresses: string[],
  transactions: TransactionsList,
};

const initialState = {
  total: 0,
  shielded: 0,
  transparent: 0,
  unconfirmed: 0,
  error: null,
  isLoading: false,
  zelPrice: 0,
  addresses: [],
  transactions: [],
};

// eslint-disable-next-line
export default (state: State = initialState, action: Action) => {
  switch (action.type) {
    case LOAD_WALLET_SUMMARY:
      return { ...state, isLoading: true };
    case LOAD_WALLET_SUMMARY_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };
    case LOAD_WALLET_SUMMARY_ERROR:
      return { ...state, isLoading: false, error: action.payload.error };
    default:
      return state;
  }
};
