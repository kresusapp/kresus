import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, Redirect, useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { BackLink, ButtonLink, Form, Popconfirm, ValidatedTextInput } from '../ui';
import CategorySelect from '../reports/category-select';
import URL from './urls';
import { translate as $t, assert, NONE_CATEGORY_ID, notify, useKresusState } from '../../helpers';
import { actions, get } from '../../store';
import { Category, Rule } from '../../models';

import './rules.css';

const SharedForm = (props: {
    formTitle: string;
    initialLabel: string | null;
    initialCategoryId: number | null;
    onSubmit: (label: string | null, categoryId: number | null) => Promise<void>;
}) => {
    const [label, setLabel] = useState<string | null>(props.initialLabel);
    const [categoryId, setCategoryId] = useState<number | null>(props.initialCategoryId);

    const propsOnSubmit = props.onSubmit;
    const onSubmit = useCallback(async () => {
        await propsOnSubmit(label, categoryId);
    }, [propsOnSubmit, label, categoryId]);

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={URL.list}>{$t('client.rules.back_to_list')}</BackLink>

            <h3>{props.formTitle}</h3>

            <p>{$t('client.rules.help')}</p>

            <Form.Input id="rule-label" label={$t('client.rules.if_text_contains')}>
                <ValidatedTextInput onChange={setLabel} initialValue={label} />
            </Form.Input>

            <Form.Input id="rule-category" label={$t('client.rules.apply_category')}>
                <CategorySelect
                    value={categoryId === null ? NONE_CATEGORY_ID : categoryId}
                    onChange={setCategoryId}
                />
            </Form.Input>

            <input type="submit" />
        </Form>
    );
};

const NewForm = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const onSubmit = useCallback(
        async (label: string | null, categoryId: number | null) => {
            try {
                assert(categoryId !== null, 'categoryId must be set at this point');
                assert(label !== null, 'label must be set at this point');
                await actions.createRule(dispatch, { label, categoryId });
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
            initialLabel={null}
            initialCategoryId={null}
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
        const r = get.ruleById(state, ruleId);
        return r ? r : null;
    });

    const dispatch = useDispatch();

    const onSubmit = useCallback(
        async (label: string | null, categoryId: number | null) => {
            try {
                assert(rule !== null, 'rule must be known');
                assert(categoryId !== null, 'categoryId must be set at this point');
                assert(label !== null, 'label must be set at this point');
                await actions.updateRule(dispatch, rule, { label, categoryId });
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
    const condition = rule.conditions[0];
    assert(condition.type === 'label_matches_text', 'only know about label matches text rules!');

    assert(rule.actions.length > 0, 'must have at least a single action');
    const action = rule.actions[0];
    assert(action.type === 'categorize', 'only know about categorize rules!');

    return (
        <SharedForm
            formTitle={$t('client.rules.edition_form_title')}
            initialLabel={condition.value}
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
            await actions.deleteRule(dispatch, rule.id);
            notify.success($t('client.rules.delete_success'));
        } catch (err) {
            notify.error($t('client.rules.delete_error', { err: err.message }));
        }
    }, [dispatch, rule]);

    const onSwapPrev = useCallback(async () => {
        try {
            assert(prevRuleId !== null, 'must have a previous rule to swap with it');
            await actions.swapRulesPositions(dispatch, rule.id, prevRuleId);
        } catch (err) {
            notify.error($t('client.rules.swap_error', { err: err.message }));
        }
    }, [dispatch, rule, prevRuleId]);

    const onSwapNext = useCallback(async () => {
        try {
            assert(nextRuleId !== null, 'must have a next rule to swap with it');
            await actions.swapRulesPositions(dispatch, rule.id, nextRuleId);
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
                    {$t('client.rules.delete_confirm')}
                </Popconfirm>
            </div>
        </li>
    );
};

const List = (props: { categoryToName: Map<number, string> }) => {
    const rules = useKresusState(state => get.rules(state));

    return (
        <ul className="rules">
            {rules.map((rule, i) => {
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
            })}
        </ul>
    );
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
            await actions.loadRules(dispatch);
            setFirstLoad(false);
        }
    }, [dispatch, firstLoad, setFirstLoad]);

    useEffect(() => {
        void loadRules();
    }, [loadRules]);

    const categoryToName = useKresusState(state =>
        get.categories(state).reduce((map: Map<number, string>, cat: Category) => {
            map.set(cat.id, cat.label);
            return map;
        }, new Map())
    );

    return (
        <Switch>
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
