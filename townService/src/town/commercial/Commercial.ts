/**
 * This class is the base class for all commercial activities.
 * It is responsible for managaing the state of the commercial zones
 */
export default abstract class Commercial<StateType extends CommercialState> {
  private _state: UserStateType;

  public readonly id;
}
