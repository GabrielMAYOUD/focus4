import {uniq} from "lodash";
import {action, extendObservable, intercept} from "mobx";
import {computedFn} from "mobx-utils";
import {RouteConfig, Router as YesterRouter} from "yester";

import {Param, ParamDef} from "./param";
export {param} from "./param";

/** Callback permettant de décrire une définition de route. */
export type UrlRouteDescriptor<C, _K = unknown, _T = unknown> = (C extends ParamDef<infer K0, Param<infer T>, infer V>
    ? (param: K0) => UrlRouteDescriptor<V, K0, T>
    : <K extends keyof C>(
          x: K
      ) => C[K] extends ParamDef<infer _1, infer _2, infer _3>
          ? UrlRouteDescriptor<C[K]>
          : C[K] extends ParamDef<infer _4, infer _5>
          ? void
          : UrlRouteDescriptor<C[K]>) & {spec: C};

/** Callback permettant de décrire une URL. */
export type UrlPathDescriptor<C> = C extends ParamDef<infer _0, Param<infer T>, infer V>
    ? (param: T) => UrlPathDescriptor<V>
    : <K extends keyof C>(
          x: K
      ) => C[K] extends ParamDef<infer _1, infer _2, infer _3>
          ? UrlPathDescriptor<C[K]>
          : C[K] extends ParamDef<infer _4, infer _5>
          ? void
          : UrlPathDescriptor<C[K]>;

/** Router correspondant à la config donnée. */
export interface Router<C> {
    /** Etat du routeur. */
    state: ParamObject<C>;
    /**
     * Si la route demandée est active, retourne le morceau de route suivant.
     * @param predicate Callback décrivant la route.
     */
    get<C2>(predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>): keyof C2 | undefined;
    /**
     * Vérifie si la section de route demandée est active dans le routeur.
     * @param predicate Callback décrivant la route.
     */
    is(predicate: (x: UrlRouteDescriptor<C>) => void): boolean;
    /**
     * Navigue vers l'URL demandée.
     * @param predicate Callback décrivant l'URL.
     * @param replace Remplace la route précédente dans l'historique.
     */
    to(predicate: (x: UrlPathDescriptor<C>) => void, replace?: boolean): void;
    /**
     * Construit une vue du routeur à partir d'une route donnée, permettant de manipuler une
     * sous section du routeur.
     * @param predicate Callback décrivant la route de base de la vue.
     */
    sub<C2, K, T>(
        predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2, K, T>
    ): Router<C2> & {state: {[P in K & string]: T}};
    /** Lance le routeur. */
    start(): Promise<void>;
}

/** Builder pour construire des contraintes sur les routes d'un routeur. */
export interface RouterConstraintBuilder<C> {
    /**
     * Bloque l'accès à une route si une condition est remplie.
     * @param predicate Callback décrivant la route.
     * @param condition Condition.
     */
    block(predicate: (x: UrlRouteDescriptor<C>) => void, condition: () => boolean): RouterConstraintBuilder<C>;
    /**
     * Redirige une route vers une autre si une condition est remplie.
     * @param predicate Callback décrivant la route.
     * @param condition Condition.
     * @param to Callback décrivant l'URL cible.
     */
    redirect(
        predicate: (x: UrlRouteDescriptor<C>) => void,
        condition: () => boolean,
        to: (x: UrlPathDescriptor<C>) => void
    ): RouterConstraintBuilder<C>;
    /**
     * Construit une vue du ConstraintBuilder à partir d'une route donnée, permettant de manipuler une
     * sous section du ConstraintBuilder.
     * @param predicate Callback décrivant la route de base de la vue.
     */
    sub<C2>(predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>): RouterConstraintBuilder<C2>;
}

/** Type décrivant l'objet de valeurs de paramètre d'un routeur de configuration quelconque. */
export type ParamObject<C = any> = C extends ParamDef<infer K1, Param<infer T1>, ParamDef<infer K2, Param<infer T2>>>
    ? Record<K1, T1> & Record<K2, T2>
    : C extends ParamDef<infer A3, Param<infer N3>, infer U>
    ? Record<A3, N3> & {readonly [P in keyof U]: ParamObject<U[P]>}
    : {
          readonly [P in keyof C]: ParamObject<C[P]>;
      };

/**
 * Construit un routeur.
 * @param config Configufration du routeur.
 * @param _builder Constraintes du routeur.
 */
export function makeRouter<C>(config: C, _builder?: (b: RouterConstraintBuilder<C>) => void): Router<C> {
    /**
     * Construit l'objet de valeurs.
     * @param cIn La config du routeur.
     * @param object L'objet en cours de construction (pour appel récursif).
     */
    function buildObject<Cin>(cIn: Cin, object: ParamObject<C> = {} as any): ParamObject<C> {
        if (Array.isArray(cIn)) {
            extendObservable(object, {[cIn[0]]: undefined});
            intercept(object, cIn[0], change => {
                // Impossible de sauvegarder NaN en toute circonstance.
                if (Number.isNaN(change.newValue)) {
                    return null;
                }

                const isActive = Object.keys(store._activeParams).includes(cIn[0]);
                const isUndefined = change.newValue === undefined;

                /*
                    On s'assure que l'URL et les paramètres enregistrés sont corrects.
                    Ceci n'aura aucun effet si on met à jour la valeur après une navigation.
                    En revanche, si on modifie un paramètre à la main, la mise à jour sera effectuée.
                    Il se s'agit pas d'une navigation, donc ce ne sera pas enregistré dans l'historique.
                */
                if (isActive && !isUndefined) {
                    store._activeParams[cIn[0]] = `${change.newValue}`;
                    let route = store._activeRoute;
                    for (const param in store._activeParams) {
                        route = route.replace(`:${param}`, store._activeParams[param]);
                    }
                    if (route !== window.location.hash?.replace("#", "")) {
                        router.navigate(route, true);
                    }
                }

                // Seuls les paramètres dans la route active peuvent être modifiés.
                if ((isActive && !isUndefined) || (!isActive && isUndefined)) {
                    return change;
                }

                return null;
            });
            if (cIn[2]) {
                buildObject(cIn[2], object);
            }
        } else {
            for (const key in cIn) {
                (object as any)[key] = buildObject(cIn[key]);
            }
        }

        return object;
    }

    const store = (extendObservable(
        {state: buildObject(config)},
        {_activeRoute: "/", _activeParams: []}
    ) as any) as Router<C> & {
        _activeRoute: string;
        _activeParams: Record<string, string>;
    };
    const paramsMap = buildParamsMap(config, store.state);
    const router = new YesterRouter(
        [
            // Spécifie tous les endpoints dans le routeur.
            ...uniq(buildEndpoints(config)).map(
                $ =>
                    ({
                        $,
                        beforeEnter: action(({params, oldPath}) => {
                            store._activeRoute = $;
                            store._activeParams = params;

                            // Chaque paramètre de l'objet de valeur est réinitialisé à partir de sa valeur dans la route courante.
                            for (const key in paramsMap) {
                                if (key in params) {
                                    const newValue = paramsMap[key](params[key]);

                                    // Si valeur invalide (que pour les nombres, et ça sera toujours NaN), on refuse la navigation.
                                    if (Number.isNaN(newValue)) {
                                        return {redirect: oldPath || "/"};
                                    }
                                } else {
                                    paramsMap[key](undefined);
                                }
                            }
                        })
                    } as RouteConfig)
            ),
            {
                // Route non matchée => on revient là où on était avant (ou à la racine si premier appel).
                $: "*",
                beforeEnter: ({oldPath}) => ({redirect: oldPath || "/"})
            }
        ],
        {type: "hash"}
    );

    /** Permet de garder le résultat de "get" en "computed" pour éviter de trigger "get" à chaque changement de route. */
    const innerGet = computedFn((route: string) => {
        if (!store._activeRoute.startsWith(route)) {
            return undefined;
        } else {
            return store._activeRoute.replace(route, "").split("/")[1]?.replace(":", "");
        }
    });

    /** Fonction "get" de base */
    function get<C2>(route: string, predicate: (x: UrlRouteDescriptor<C>) => void) {
        const builder = (path: string) => {
            route += `/${Object.keys(paramsMap).includes(path) ? `:${path}` : path}`;
            return builder;
        };
        predicate(builder as any);
        return innerGet(route) as keyof C2 | undefined;
    }

    /** Permet de garder le résultat de "is" en "computed" pour éviter de trigger "is" à chaque changement de route. */
    const innerIs = computedFn((route: string) => store._activeRoute.startsWith(route));

    /** Fonction "is" de base */
    function is(route: string, predicate: (x: UrlRouteDescriptor<C>) => void) {
        const builder = (path: string) => {
            route += `/${Object.keys(paramsMap).includes(path) ? `:${path}` : path}`;
            return builder;
        };
        predicate(builder as any);
        return innerIs(route);
    }

    /** Fonction "to" de base */
    function to(route: string, predicate: (x: UrlPathDescriptor<C>) => void, replace: boolean) {
        const builder = (path: string) => {
            route += `/${path}`;
            return builder;
        };
        predicate(builder as any);
        if (!route) {
            route = "/";
        }
        if (route !== window.location.hash?.replace("#", "")) {
            router.navigate(route, replace);
        }
    }

    /** Fonction "sub" de base */
    function sub(route: string, state: any, predicate: (x: UrlRouteDescriptor<C>) => void): any {
        const builder = (path: string) => {
            const isParam = Object.keys(paramsMap).includes(path);
            route += `/${isParam ? `:${path}` : path}`;
            if (!isParam) {
                state = (state as any)[path];
            }
            return builder;
        };
        predicate(builder as any);

        return {
            state,
            get: (p: any) => get(route, p),
            is: (p: any) => is(route, p),
            to: (p: any, r = false) => {
                let baseRoute = route;
                for (const param in store._activeParams) {
                    baseRoute = baseRoute.replace(`:${param}`, store._activeParams[param]);
                }
                to(baseRoute, p, r);
            },
            sub: (p: any) => sub(route, state, p),
            start: () => {
                /** */
            }
        };
    }

    store.get = p => get("", p);
    store.is = p => is("", p);
    store.to = (p, r = false) => to("", p, r);
    store.sub = p => sub("", store.state, p);
    store.start = router.init.bind(router) as () => Promise<void>;

    return store;
}

/**
 * Construit la liste des endpoints du routeur.
 * @param config Config du routeur.
 */
function buildEndpoints<C>(config: C) {
    const endpoints: string[] = [];

    function addEndpoints(c: any, root: string) {
        if (Array.isArray(c)) {
            if (!c[1].required) {
                endpoints.push(root);
            }

            root = `${root}/:${c[0]}`;

            if (!Array.isArray(c[2])) {
                endpoints.push(root);
            }

            if (c[2]) {
                addEndpoints(c[2], root);
            }
        } else {
            endpoints.push(root);
            for (const key in c) {
                addEndpoints(c[key], `${root}/${key}`);
            }
        }
    }

    endpoints.push("/");
    addEndpoints(config, "");

    return endpoints;
}

/**
 * Construit la map de setters des paramètres du routeur.
 * @param config Config du routeur.
 * @param object Object de paramètres pré-construit.
 * @param params Pour récursion.
 */
function buildParamsMap<C>(
    config: C,
    object: ParamObject<C>,
    params: Record<string, (value: string | undefined) => string | number | undefined> = {}
) {
    if (Array.isArray(config)) {
        const setter = (value: string | undefined) => {
            const newValue = config[1].type === "number" && value !== undefined ? parseFloat(value) : value;
            (object as any)[config[0]] = newValue;
            return newValue;
        };

        if (params[config[0]]) {
            const existing = params[config[0]];
            params[config[0]] = value => {
                existing(value);
                setter(value);
                return value;
            };
        } else {
            params[config[0]] = setter;
        }

        if (config[2]) {
            buildParamsMap(config[2], object, params);
        }
    } else {
        for (const key in config) {
            buildParamsMap(config[key], (object as any)[key], params);
        }
    }

    return params;
}
