import * as std from "tstl";

import {ICollection} from "../basic/ICollection";
import {CollectionEvent} from "../basic/CollectionEvent";
import {EventDispatcher} from "../basic/EventDispatcher";

export class HashSet<T> 
	extends std.HashSet<T>
	implements ICollection<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>
{
	/**
	 * @hidden
	 */
	private dispatcher_: EventDispatcher<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>> = new EventDispatcher();

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
	public refresh(it: std.HashSet.Iterator<T>): void;
	public refresh(first: std.HashSet.Iterator<T>, last: std.HashSet.Iterator<T>): void;

	public refresh(first: std.HashSet.Iterator<T>, last: std.HashSet.Iterator<T> = first.next()): void
	{
		this.dispatchEvent(new CollectionEvent("refresh", first, last));
	}

	public dispatchEvent(event: HashSet.Event<T>): void
	{
		this.dispatcher_.dispatchEvent(event);
	}

	/* ---------------------------------------------------------
		ACCESSORS
	--------------------------------------------------------- */
	public hasEventListener(type: CollectionEvent.Type): boolean
	{
		return this.dispatcher_.hasEventListener(type);
	}

	public addEventListener(type: CollectionEvent.Type, listener: HashSet.Listener<T>): void
	{
		this.dispatcher_.addEventListener(type, listener);
	}

	public removeEventListener(type: CollectionEvent.Type, listener: HashSet.Listener<T>): void
	{
		this.dispatcher_.removeEventListener(type, listener);
	}
}

export namespace HashSet
{
	export type Event<T> = CollectionEvent<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>;
	export type Listener<T> = CollectionEvent.Listener<T, std.HashSet<T>, std.HashSet.Iterator<T>, std.HashSet.ReverseIterator<T>>;
}