import * as std from "tstl";

import {ICollection} from "../basic/ICollection";
import {CollectionEvent} from "../basic/CollectionEvent";
import {EventDispatcher} from "../basic/EventDispatcher";

import "./internal";

export class HashMapCollection<Key, T> 
	extends std.HashMap<Key, T>
	implements ICollection<std.Entry<Key, T>, 
		std.HashMap<Key, T>, 
		std.HashMap.Iterator<Key, T>, 
		std.HashMap.ReverseIterator<Key, T>>
{
	/**
	 * @hidden
	 */
	private dispatcher_: EventDispatcher<std.Entry<Key, T>, 
		std.HashMap<Key, T>, 
		std.HashMap.Iterator<Key, T>, 
		std.HashMap.ReverseIterator<Key, T>> = new EventDispatcher();

	/* ---------------------------------------------------------
		CONSTRUCTORS
	--------------------------------------------------------- */
	// using super.constructor;

	public clear(): void
	{
		let first = this.begin();
		let last = this.end();

		super.clear();
		this.dispatchEvent(new CollectionEvent("erase", first, last));
	}

	/* ---------------------------------------------------------
		ELEMENTS I/O
	--------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected _Handle_insert(first: std.HashMap.Iterator<Key, T>, last: std.HashMap.Iterator<Key, T>): void
	{
		super._Handle_insert(first, last);
		
		this.dispatchEvent(new CollectionEvent("insert", first, last));
	}

	/**
	 * @hidden
	 */
	protected _Handle_erase(first: std.HashMap.Iterator<Key, T>, last: std.HashMap.Iterator<Key, T>): void
	{
		this._Handle_erase(first, last);
		
		this.dispatchEvent(new CollectionEvent("erase", first, last));
	}

	/* =========================================================
		EVENT DISPATCHER
			- NOTIFIERS
			- ACCESSORS
	============================================================
		NOTIFIERS
	--------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public dispatchEvent(event: HashMapCollection.Event<Key, T>): void
	{
		if (this.dispatcher_)
			this.dispatcher_.dispatchEvent(event);
	}

	/**
	 * @inheritDoc
	 */
	public refresh(): void;

	/**
	 * @inheritDoc
	 */
	public refresh(it: std.HashMap.Iterator<Key, T>): void;

	/**
	 * @inheritDoc
	 */
	public refresh(first: std.HashMap.Iterator<Key, T>, last: std.HashMap.Iterator<Key, T>): void;

	public refresh(first: std.HashMap.Iterator<Key, T> = null, last: std.HashMap.Iterator<Key, T> = null): void
	{
		if (first == null)
		{
			first = this.begin();
			last = this.end();
		}
		else if (last == null)
			last = first.next();

		this.dispatchEvent(new CollectionEvent("refresh", first, last));
	}

	/* ---------------------------------------------------------
		ACCESSORS
	-------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public hasEventListener(type: CollectionEvent.Type): boolean
	{
		return this.dispatcher_.hasEventListener(type);
	}

	/**
	 * @inheritDoc
	 */
	public addEventListener(type: CollectionEvent.Type, listener: HashMapCollection.Listener<Key, T>): void
	{
		this.dispatcher_.addEventListener(type, listener);
	}

	/**
	 * @inheritDoc
	 */
	public removeEventListener(type: CollectionEvent.Type, listener: HashMapCollection.Listener<Key, T>): void
	{
		this.dispatcher_.removeEventListener(type, listener);
	}
}

export namespace HashMapCollection
{
	export type Event<Key, T> = CollectionEvent<std.Entry<Key, T>, 
		std.HashMap<Key, T>, 
		std.HashMap.Iterator<Key, T>, 
		std.HashMap.ReverseIterator<Key, T>>;

	export type Listener<Key, T> = CollectionEvent.Listener<std.Entry<Key, T>, 
		std.HashMap<Key, T>, 
		std.HashMap.Iterator<Key, T>, 
		std.HashMap.ReverseIterator<Key, T>>;

	export const Event = CollectionEvent;
	export import Iterator = std.HashMap.Iterator;
	export import ReverseIterator = std.HashMap.ReverseIterator;
}

const old_swap = std.HashMap.prototype.swap;
std.HashMap.prototype.swap = function <Key, T>(obj: std.HashMap<Key, T>): void
{
	old_swap.call(this, obj);

	if (this instanceof HashMapCollection)
		this.refresh();
	if (obj instanceof HashMapCollection)
		obj.refresh();
};