import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, Redirect, useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { BackLink, ButtonLink, Form, Popconfirm, ValidatedTextInput, AmountInput } from '../ui';
import CategorySelect from '../reports/category-select';
import URL from './urls';
import { translate as $t, assert, NONE_CATEGORY_ID, notify, useKresusState } from '../../helpers';
import * as CategoriesStore from '../../store/categories';
import * as RulesStore from '../../store/rules';
import { Category, Rule } from '../../models';

import './rules.css';
import { LoadingMessage } from '../overlay';

const SharedForm = (props: {
    formTitle: string;
    formSubmitLabel: string;
    initialLabel: string | null;
    initialAmount: number | null;
    initialCategoryId: number | null;
    onSubmit: (
        label: string | null,
        amount: number | null,
        categoryId: number | null
    ) => Promise<void>;
}) => {
    const [label, setLabel] = useState<string | null>(props.initialLabel);
    const [amount, setAmount] = useState<number | null>(props.initialAmount);
    const [categoryId, setCategoryId] = useState<number | null>(props.initialCategoryId);

    const propsOnSubmit = props.onSubmit;
    const onSubmit = useCallback(async () => {
        await propsOnSubmit(label, Number.isNaN(amount) ? null : amount, categoryId);
    }, [propsOnSubmit, label, amount, categoryId]);

    const submitIsDisabled =
        label === null || categoryId === null || categoryId === NONE_CATEGORY_ID;

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={URL.list}>{$t('client.rules.back_to_list')}</BackLink>

            <h3>{props.formTitle}</h3>

            <p>{$t('client.rules.help')}</p>

            <Form.Input id="rule-label" label={$t('client.rules.if_text_contains')}>
                <ValidatedTextInput onChange={setLabel} initialValue={label} />
            </Form.Input>

            <Form.Input id="rule-amount" label={$t('client.rules.if_amount_equals')}>
                <AmountInput signId="rule-amount-sign" onChange={setAmount} defaultValue={amount} />
            </Form.Input>

            <Form.Input id="rule-category" label={$t('client.rules.apply_category')}>
                <CategorySelect
                    value={categoryId === null ? NONE_CATEGORY_ID : categoryId}
                    onChange={setCategoryId}
                />
            </Form.Input>

            <input type="submit" value={props.formSubmitLabel} disabled={submitIsDisabled} />
        </Form>
    );
};

const NewForm = (props: { categoryToName?: Map<number, string> }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const {
        label: rawPredefinedLabel,
        amount: rawPredefinedAmount,
        categoryId: categoryIdStr,
    } = useParams<{
        label?: string;
        amount?: string;
        categoryId?: string;
    }>();

    let predefinedLabel = rawPredefinedLabel;
    if (predefinedLabel) {
        predefinedLabel = window.decodeURIComponent(predefinedLabel);
    }

    let predefinedAmount = null;
    if (rawPredefinedAmount) {
        predefinedAmount = parseFloat(rawPredefinedAmount);
        if (isNaN(predefinedAmount)) {
            predefinedAmount = null;
        }
    }

    let predefinedRuleId: number | null = Number.parseInt(categoryIdStr || '', 10);
    if (Number.isNaN(predefinedRuleId)) {
        // If the URL category id wasn't a string, replace it with no category.
        predefinedRuleId = null;
    } else if (props.categoryToName && !props.categoryToName.has(predefinedRuleId)) {
        // If the URL category id doesn't exist, replace it with no category.
        predefinedRuleId = null;
    }

    const onSubmit = useCallback(
        async (label: string | null, amount: number | null, categoryId: number | null) => {
            try {
                assert(categoryId !== null, 'categoryId must be set at this point');
                assert(label !== null, 'label must be set at this point');
                await dispatch(RulesStore.create({ label, amount, categoryId }));
                notify.success($t('client.rules.creation_success'));
                history.push(URL.list);
            } catch (err) {
                notify.error($t('client.rules.creation_error', { err: err.message }));
            }
        },
        [history, dispatch]
    );

    return (
        <SharedForm
            formTitle={$t('client.rules.creation_form_title')}
            formSubmitLabel={$t('client.rules.create_rule')}
            initialLabel={predefinedLabel || null}
            initialAmount={predefinedAmount}
            initialCategoryId={predefinedRuleId}
            onSubmit={onSubmit}
        />
    );
};

const EditForm = () => {
    const history = useHistory();

    const { ruleId: ruleIdStr } = useParams<{ ruleId: string }>();
    const ruleId = Number.parseInt(ruleIdStr, 10);

    const rule = useKresusState(state => {
        if (Number.isNaN(ruleId)) {
            return null;
        }
        const r = RulesStore.getById(state.rules, ruleId);
        return r ? r : null;
    });

    const dispatch = useDispatch();

    const onSubmit = useCallback(
        async (label: string | null, amount: number | null, categoryId: number | null) => {
            try {
                assert(rule !== null, 'rule must be known');
                assert(categoryId !== null, 'categoryId must be set at this point');
                assert(label !== null, 'label must be set at this point');
                await dispatch(RulesStore.update({ rule, arg: { label, amount, categoryId } }));
                notify.success($t('client.rules.edit_success'));
                history.push(URL.list);
            } catch (err) {
                notify.error($t('client.rules.edit_error', { err: err.message }));
            }
        },
        [rule, history, dispatch]
    );

    if (Number.isNaN(ruleId)) {
        notify.error($t('client.rules.rule_not_found'));
        history.push(URL.list);
        return null;
    }

    if (rule === null) {
        // Still loading the rules...
        return null;
    }

    assert(rule.conditions.length > 0, 'must have at least a single condition');

    let initialLabel = null;
    let initialAmount = null;

    for (const condition of rule.conditions) {
        switch (condition.type) {
            case 'label_matches_text':
                initialLabel = condition.value;
                break;

            case 'amount_equals':
                initialAmount = parseFloat(condition.value);
                break;

            default:
                assert(false, 'Invalid condition type');
        }
    }

    assert(rule.actions.length > 0, 'must have at least a single action');
    const action = rule.actions[0];
    assert(action.type === 'categorize', 'only know about categorize rules!');

    return (
        <SharedForm
            formTitle={$t('client.rules.edition_form_title')}
            formSubmitLabel={$t('client.rules.edit_rule')}
            initialLabel={initialLabel}
            initialAmount={initialAmount}
            initialCategoryId={action.categoryId}
            onSubmit={onSubmit}
        />
    );
};

const RuleText = (props: { categoryToName: Map<number, string>; rule: Rule }) => {
    const conditionsText = [];
    let first = true;
    for (const condition of props.rule.conditions) {
        if (!first) {
            conditionsText.push(<>{$t('client.rules.and')}&nbsp;</>);
        } else {
            first = false;
        }

        switch (condition.type) {
            case 'label_matches_text':
                conditionsText.push(
                    <>
                        {$t('client.rules.transaction_label_contains')}{' '}
                        <strong>{condition.value}</strong>&nbsp;
                    </>
                );
                break;
            case 'label_matches_regexp':
                conditionsText.push(
                    <>
                        {$t('client.rules.transaction_label_matches')}{' '}
                        <strong>{condition.value}</strong>&nbsp;
                    </>
                );
                break;
            case 'amount_equals':
                conditionsText.push(
                    <>
                        {$t('client.rules.transaction_amount_equals')}{' '}
                        <strong>{condition.value}</strong>&nbsp;
                    </>
                );
                break;
            default:
                assert(false, "unknown rule's condition type");
        }
    }

    const actionsText = [];
    first = true;
    for (const action of props.rule.actions) {
        if (!first) {
            actionsText.push(<>{$t('client.rules.and')}&nbsp;</>);
        } else {
            first = false;
        }

        switch (action.type) {
            case 'categorize':
                actionsText.push(
                    <>
                        {$t('client.rules.categorize_as')}{' '}
                        <strong>{props.categoryToName.get(action.categoryId)}</strong>&nbsp;
                    </>
                );
                break;
            default:
                assert(false, "unknown rule's action type");
        }
    }

    let i = 0;
    return (
        <p>
            {$t('client.rules.If')}&nbsp;
            {conditionsText.map(el => React.cloneElement(el, { ...el.props, key: i++ }))}
            {$t('client.rules.then')}&nbsp;
            {actionsText.map(el => React.cloneElement(el, { ...el.props, key: i++ }))}
        </p>
    );
};

const ListItem = (props: {
    index: number;
    numRules: number;
    prevRuleId: number | null;
    nextRuleId: number | null;
    rule: Rule;
    categoryToName: Map<number, string>;
}) => {
    const dispatch = useDispatch();

    const { prevRuleId, nextRuleId, index, numRules, rule } = props;

    const onDelete = useCallback(async () => {
        try {
            await dispatch(RulesStore.destroy(rule.id));
            notify.success($t('client.rules.delete_success'));
        } catch (err) {
            notify.error($t('client.rules.delete_error', { err: err.message }));
        }
    }, [dispatch, rule]);

    const onSwapPrev = useCallback(async () => {
        try {
            assert(prevRuleId !== null, 'must have a previous rule to swap with it');
            await dispatch(RulesStore.swapPositions({ ruleId: rule.id, otherRuleId: prevRuleId }));
        } catch (err) {
            notify.error($t('client.rules.swap_error', { err: err.message }));
        }
    }, [dispatch, rule, prevRuleId]);

    const onSwapNext = useCallback(async () => {
        try {
            assert(nextRuleId !== null, 'must have a next rule to swap with it');
            await dispatch(RulesStore.swapPositions({ ruleId: rule.id, otherRuleId: nextRuleId }));
        } catch (err) {
            notify.error($t('client.rules.swap_error', { err: err.message }));
        }
    }, [dispatch, rule, nextRuleId]);

    return (
        <li>
            <RuleText categoryToName={props.categoryToName} rule={props.rule} />

            <div className="buttons">
                <ButtonLink
                    className="primary"
                    to={URL.edit.url(props.rule.id)}
                    aria={$t('client.rules.edit_rule')}
                    icon="edit"
                />

                <button
                    className="btn primary"
                    aria-label={$t('client.rules.move_up')}
                    title={$t('client.rules.move_up')}
                    onClick={onSwapPrev}
                    disabled={index === 0}>
                    <span className="fa fa-arrow-up" />
                </button>

                <button
                    className="btn primary"
                    aria-label={$t('client.rules.move_down')}
                    title={$t('client.rules.move_down')}
                    onClick={onSwapNext}
                    disabled={index === numRules - 1}>
                    <span className="fa fa-arrow-down" />
                </button>

                <Popconfirm
                    trigger={
                        <button
                            className="btn danger"
                            aria-label={$t('client.rules.delete')}
                            title={$t('client.rules.delete')}>
                            <span className="fa fa-trash" />
                        </button>
                    }
                    onConfirm={onDelete}>
                    <p>{$t('client.rules.delete_confirm')}</p>
                </Popconfirm>
            </div>
        </li>
    );
};

const List = (props: { categoryToName: Map<number, string> }) => {
    const rules = useKresusState(state => RulesStore.getAll(state.rules));

    const ruleItems = rules.map((rule, i) => {
        const prevRuleId = i > 0 ? rules[i - 1].id : null;
        const nextRuleId = i + 1 < rules.length ? rules[i + 1].id : null;
        return (
            <ListItem
                key={rule.id}
                index={i}
                numRules={rules.length}
                rule={rule}
                prevRuleId={prevRuleId}
                nextRuleId={nextRuleId}
                categoryToName={props.categoryToName}
            />
        );
    });

    const content = rules.length > 0 ? ruleItems : $t('client.rules.no_rules');

    return <ul className="rules">{content}</ul>;
};

export default () => {
    // Load the rules the first time we navigate within the family of
    // components from the outside. This is not done in the List component
    // because displaying the list after creating a rule would reload the list
    // of rules every single time, which is unnecessary.

    const [firstLoad, setFirstLoad] = useState(true);
    const dispatch = useDispatch();

    const loadRules = useCallback(async () => {
        if (firstLoad) {
            await dispatch(RulesStore.loadAll());
            setFirstLoad(false);
        }
    }, [dispatch, firstLoad, setFirstLoad]);

    useEffect(() => {
        void loadRules();
    }, [loadRules]);

    const categoryToName = useKresusState(state =>
        CategoriesStore.all(state.categories).reduce((map: Map<number, string>, cat: Category) => {
            map.set(cat.id, cat.label);
            return map;
        }, new Map())
    );

    if (firstLoad) {
        return <LoadingMessage message={$t('client.rules.loading_rules')} />;
    }

    return (
        <Switch>
            <Route path={URL.predefinedNew.pattern} exact={true}>
                <NewForm categoryToName={categoryToName} />
            </Route>
            <Route path={URL.new}>
                <NewForm />
            </Route>
            <Route path={URL.edit.pattern}>
                <EditForm />
            </Route>
            <Route path={URL.list}>
                <ButtonLink
                    to={URL.new}
                    aria={$t('client.rules.new_rule')}
                    label={$t('client.rules.new_rule')}
                    icon="plus"
                />
                <hr />
                <List categoryToName={categoryToName} />
            </Route>
            <Redirect to={URL.list} push={false} />
        </Switch>
    );
};
