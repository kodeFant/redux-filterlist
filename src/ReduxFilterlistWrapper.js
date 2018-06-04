import { Component, createElement } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash.isequal';

import { listIdPropTypes, listStatePropTypes, reduxFilterlistParamsShape } from './propTypes';
import { LoadListError, RequestCanceledError } from './errors';

class ReduxFilterlistWrapper extends Component {
  static propTypes = {
    listId: listIdPropTypes.isRequired,

    loadItems: PropTypes.func.isRequired,
    onBeforeRequest: PropTypes.func,

    listState: listStatePropTypes({}).isRequired,

    listActions: PropTypes.shape({
      registerList: PropTypes.func.isRequired,
      destroyList: PropTypes.func.isRequired,

      setStateFromProps: PropTypes.func.isRequired,

      loadList: PropTypes.func.isRequired,
      loadListSuccess: PropTypes.func.isRequired,
      loadListError: PropTypes.func.isRequired,

      setFilterValue: PropTypes.func.isRequired,
      applyFilter: PropTypes.func.isRequired,
      setAndApplyFilter: PropTypes.func.isRequired,
      resetFilter: PropTypes.func.isRequired,

      setFiltersValues: PropTypes.func.isRequired,
      applyFilters: PropTypes.func.isRequired,
      setAndApplyFilters: PropTypes.func.isRequired,
      resetFilters: PropTypes.func.isRequired,

      resetAllFilters: PropTypes.func.isRequired,

      setSorting: PropTypes.func.isRequired,
      resetSorting: PropTypes.func.isRequired,

      insertItem: PropTypes.func.isRequired,
      deleteItem: PropTypes.func.isRequired,
      updateItem: PropTypes.func.isRequired,
    }).isRequired,

    WrappedComponent: PropTypes.func.isRequired,
    reduxFilterlistParams: reduxFilterlistParamsShape.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    componentProps: PropTypes.object.isRequired,
  }

  static defaultProps = {
    onBeforeRequest: null,
  }

  componentWillMount() {
    const {
      listId,
      reduxFilterlistParams,
      componentProps,
    } = this.props;

    this.props.listActions.registerList(listId, reduxFilterlistParams, componentProps);
  }

  async componentDidMount() {
    if (this.props.listState.autoload) {
      await this.loadItems();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.listState !== this.props.listState ||
      !isEqual(nextProps.componentProps, this.props.componentProps);
  }

  async componentDidUpdate(prevProps) {
    const {
      shouldRecountState,
      getStateFromProps,
    } = this.props.reduxFilterlistParams;

    if (
      getStateFromProps &&
      shouldRecountState &&
      shouldRecountState(this.props.componentProps, prevProps.componentProps)
    ) {
      const {
        appliedFilters,
        sort,
      } = getStateFromProps(this.props.componentProps);

      await this.setStateFromProps(appliedFilters, sort);
    }
  }

  componentWillUnmount() {
    const {
      listId,
    } = this.props;

    this.props.listActions.destroyList(listId);
  }

  setStateFromProps = async (appliedFilters, sort) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.setStateFromProps(listId, appliedFilters, sort);

    await this.requestItems(requestId);
  }

  setAndApplyFilter = async (filterName, value) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.setAndApplyFilter(listId, filterName, value);

    await this.requestItems(requestId);
  }

  setFilterValue = (filterName, value) => {
    const {
      listId,
      listActions,
    } = this.props;

    listActions.setFilterValue(listId, filterName, value);
  }

  setFiltersValues = (values) => {
    const {
      listId,
      listActions,
    } = this.props;

    listActions.setFiltersValues(listId, values);
  }

  setAndApplyFilters = async (values) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.setAndApplyFilters(listId, values);

    await this.requestItems(requestId);
  }

  setSorting = async (param, asc) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.setSorting(listId, param, asc);

    await this.requestItems(requestId);
  }

  resetSorting = async () => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.resetSorting(listId);

    await this.requestItems(requestId);
  }

  insertItem = (itemIndex, item, additional) => {
    const {
      listId,
      listActions,
    } = this.props;

    listActions.insertItem(listId, itemIndex, item, additional);
  }

  deleteItem = (itemIndex, additional) => {
    const {
      listId,
      listActions,
    } = this.props;

    listActions.deleteItem(listId, itemIndex, additional);
  }

  updateItem = (itemIndex, item, additional) => {
    const {
      listId,
      listActions,
    } = this.props;

    listActions.updateItem(listId, itemIndex, item, additional);
  }

  resetAllFilters = async () => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.resetAllFilters(listId);

    await this.requestItems(requestId);
  }

  resetFilters = async (filtersNames) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.resetFilters(listId, filtersNames);

    await this.requestItems(requestId);
  }

  applyFilters = async (filtersNames) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.applyFilters(listId, filtersNames);

    await this.requestItems(requestId);
  }

  resetFilter = async (filterName) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.resetFilter(listId, filterName);

    await this.requestItems(requestId);
  }

  applyFilter = async (filterName) => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.applyFilter(listId, filterName);

    await this.requestItems(requestId);
  }

  loadItems = async () => {
    const {
      listId,
      listActions,
      listState: {
        requestId,
      },
    } = this.props;

    listActions.loadList(listId);

    await this.requestItems(requestId);
  }

  waitForRequestIdUpdate(incrementedRequestId) {
    return new Promise((resolve, reject) => {
      const iteration = () => {
        const currentRequestId = this.props.listState.requestId;

        if (currentRequestId > incrementedRequestId) {
          reject(new RequestCanceledError());
        }

        if (currentRequestId === incrementedRequestId) {
          resolve();

          return;
        }

        setTimeout(iteration);
      };

      setTimeout(iteration);
    });
  }

  async requestItems(requestId) {
    const incrementedRequestId = requestId + 1;

    try {
      await this.waitForRequestIdUpdate(incrementedRequestId);
    } catch (catchedError) {
      if (catchedError instanceof RequestCanceledError) {
        return;
      }

      throw catchedError;
    }

    const {
      componentProps,
      listId,
      loadItems,
      listState,
      listActions,
      onBeforeRequest,
    } = this.props;

    if (incrementedRequestId !== listState.requestId) {
      return;
    }

    if (onBeforeRequest) {
      onBeforeRequest(listState, componentProps);
    }

    let response;
    let error;
    let isSuccess;
    try {
      const successResponse = await loadItems(listState, componentProps);
      response = successResponse;
      isSuccess = true;
    } catch (catchedError) {
      error = catchedError;
      isSuccess = false;
    }

    if (incrementedRequestId !== this.props.listState.requestId) {
      return;
    }

    if (isSuccess) {
      listActions.loadListSuccess(listId, response);
      return;
    }

    if (error instanceof RequestCanceledError) {
      return;
    }

    if (error instanceof LoadListError) {
      listActions.loadListError(listId, error.errors);
      return;
    }

    throw error;
  }

  collectComponentProps() {
    const {
      componentProps,
      listId,
      listState,
    } = this.props;

    return {
      ...componentProps,

      listId,
      listState,
      loadItems: this.loadItems,

      setFilterValue: this.setFilterValue,
      applyFilter: this.applyFilter,
      setAndApplyFilter: this.setAndApplyFilter,
      resetFilter: this.resetFilter,

      setFiltersValues: this.setFiltersValues,
      applyFilters: this.applyFilters,
      setAndApplyFilters: this.setAndApplyFilters,
      resetFilters: this.resetFilters,

      resetAllFilters: this.resetAllFilters,

      setSorting: this.setSorting,
      resetSorting: this.resetSorting,

      insertItem: this.insertItem,
      deleteItem: this.deleteItem,
      updateItem: this.updateItem,
    };
  }

  render() {
    const {
      WrappedComponent,
    } = this.props;

    return createElement(WrappedComponent, this.collectComponentProps());
  }
}

export default ReduxFilterlistWrapper;
