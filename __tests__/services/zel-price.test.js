// @flow

import getZELPrice from '../../services/zel-price';

describe('ZEL PRICE Services', () => {
  test('should return the right value', async () => {
    const response = await getZELPrice(['BRL', 'EUR', 'USD']);

    expect(response).toEqual({
      USD: expect.any(Number),
      BRL: expect.any(Number),
      EUR: expect.any(Number),
    });
  });
});
