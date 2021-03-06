import * as std from "tstl";

import {ICollection} from "../basic/ICollection";
import {CollectionEvent} from "../basic/CollectionEvent";
import {EventDispatcher} from "../basic/EventDispatcher";

export class HashSetCollection<T> 
	extends std.HashSet<T>
	implements ICollection<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>
{
	/**
	 * @hidden
	 */
	private dispatcher_: EventDispatcher<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>> = new EventDispatcher();

	/* ---------------------------------------------------------
		CONSTRUCTORS
	--------------------------------------------------------- */
	// using super.constructor

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
	protected _Handle_insert(first: std.HashSet.Iterator<T>, last: std.HashSet.Iterator<T>): void
	{
		super._Handle_insert(first, last);
		
		this.dispatchEvent(new CollectionEvent("insert", first, last));
	}

	/**
	 * @hidden
	 */
	protected _Handle_erase(first: std.HashSet.Iterator<T>, last: std.HashSet.Iterator<T>): void
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
	public dispatchEvent(event: HashSetCollection.Event<T>): void
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
	public refresh(it: std.HashSet.Iterator<T>): void;

	/**
	 * @inheritDoc
	 */
	public refresh(first: std.HashSet.Iterator<T>, last: std.HashSet.Iterator<T>): void;

	public refresh(first: std.HashSet.Iterator<T> = null, last: std.HashSet.Iterator<T> = null): void
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
	--------------------------------------------------------- */
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
	public addEventListener(type: CollectionEvent.Type, listener: HashSetCollection.Listener<T>): void
	{
		this.dispatcher_.addEventListener(type, listener);
	}

	/**
	 * @inheritDoc
	 */
	public removeEventListener(type: CollectionEvent.Type, listener: HashSetCollection.Listener<T>): void
	{
		this.dispatcher_.removeEventListener(type, listener);
	}
}

export namespace HashSetCollection
{
	export type Event<T> = CollectionEvent<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>;
	export type Listener<T> = CollectionEvent.Listener<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>;

	export const Event = CollectionEvent;
	export import Iterator = std.HashSet.Iterator;
	export import ReverseIterator = std.HashSet.ReverseIterator;
}

const old_swap = std.HashSet.prototype.swap;
std.HashSet.prototype.swap = function <T>(obj: std.HashSet<T>): void
{
	old_swap.call(this, obj);

	if (this instanceof HashSetCollection)
		this.refresh();
	if (obj instanceof HashSetCollection)
		obj.refresh();
};