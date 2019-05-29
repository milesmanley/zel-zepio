// @flow

import { connect } from 'react-redux';

import { SidebarComponent } from '../components/sidebar';

import type { AppState } from '../types/app-state';

export type MapStateToProps = {|
  zelcashNetwork: string,
  embeddedDaemon: boolean,
|};

const mapStateToProps = ({ app }: AppState): MapStateToProps => ({
  zelcashNetwork: app.zelcashNetwork,
  embeddedDaemon: app.embeddedDaemon,
});

// $FlowFixMe
export const SidebarContainer = connect(
  mapStateToProps,
)(SidebarComponent);
