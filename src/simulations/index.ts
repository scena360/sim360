import { oneAvatarJoinsRoom } from './one-avatar-joins-room';

export type SimName = 'oneAvatarJoinsRoom';

const sims: {
  [key: string]: () => Promise<void>;
} = {
  oneAvatarJoinsRoom,
};

export const startSim = async (simName: 'oneAvatarJoinsRoom') => {
  return sims[simName]();
};
