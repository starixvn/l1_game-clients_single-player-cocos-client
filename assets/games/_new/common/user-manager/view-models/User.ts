export class User {
  public nickname: string;
  public avatarId: number;
  public balance: number;
  public currency: string;
  public isCash: boolean;

  constructor(nickname, avatarId, balance, currency, isCash) {
    this.nickname = nickname;
    this.avatarId = avatarId;
    this.balance = balance;
    this.currency = currency;
    this.isCash = isCash;
  }
}
