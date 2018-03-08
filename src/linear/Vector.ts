import * as std from "tstl";

import {ICollection} from "../basic/ICollection";
import {CollectionEvent} from "../basic/CollectionEvent";
import {EventDispatcher} from "../basic/EventDispatcher";

export class Vector<T> 
	extends std.Vector<T>
	implements ICollection<T, std.Vector<T>, std.Vector.Iterator<T>, std.Vector.ReverseIterator<T>>
{
	/**
	 * @hidden
	 */
	private dispatcher_: EventDispatcher<T, std.Vector<T>, std.Vector.Iterator<T>, std.Vector.ReverseIterator<T>> = new EventDispatcher();

	/* =========================================================
		ELEMENTS I/O
			- INSERT
			- ERASE
	============================================================
		INSERT
	--------------------------------------------------------- */
	public push(...items: T[]): number
	{
		let n: number = this.size();
		let ret: number = super.push(...items);

		this._Notify_insert(this.begin().advance(n), this.end());
		return ret;
	}

	/**
	 * @inheritdoc
	 */
	public push_back(val: T): void
	{
		super.push(val);

		this._Notify_insert(this.end().prev(), this.end());
	}

	/**
	 * @hidden
	 */
	protected _Insert_by_range<U extends T, InputIterator extends std.IForwardIterator<U, InputIterator>>
		(pos: std.Vector.Iterator<T>, first: InputIterator, last: InputIterator): std.Vector.Iterator<T>
	{
		let n: number = this.size();
		let ret = super._Insert_by_range(pos, first, last);
		
		n = this.size() - n;
		this._Notify_insert(ret, ret.advance(n));

		return ret;
	}

	/* ---------------------------------------------------------
		ERASE
	--------------------------------------------------------- */
	/**
	 * @inheritdoc
	 */
	public pop_back(): void
	{
		this._Notify_erase(this.end().prev(), this.end());

		super.pop_back();
	}

	/**
	 * @hidden
	 */
	protected _Erase_by_range(first: std.Vector.Iterator<T>, last: std.Vector.Iterator<T>): std.Vector.Iterator<T>
	{
		this._Notify_erase(first, last);

		return super._Erase_by_range(first, last);
	}

	/* =========================================================
		EVENT DISPATCHER
			- NOTIFIERS
			- ACCESSORS
	============================================================
		NOTIFIERS
	--------------------------------------------------------- */
	public refresh(it: std.Vector.Iterator<T>): void;
	public refresh(first: std.Vector.Iterator<T>, last: std.Vector.Iterator<T>): void;

	public refresh(first: std.Vector.Iterator<T>, last: std.Vector.Iterator<T> = first.next()): void
	{
		this.dispatchEvent(new CollectionEvent("refresh", first, last));
	}

	/**
	 * @hidden
	 */
	private _Notify_insert(first: std.Vector.Iterator<T>, last: std.Vector.Iterator<T>): void
	{
		this.dispatchEvent(new CollectionEvent("insert", first, last));
	}

	/**
	 * @hidden
	 */
	private _Notify_erase(first: std.Vector.Iterator<T>, last: std.Vector.Iterator<T>): void
	{
		this.dispatchEvent(new CollectionEvent("erase", first, last));
	}

	public dispatchEvent(event: Vector.Event<T>): void
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

	public addEventListener(type: CollectionEvent.Type, listener: Vector.Listener<T>): void
	{
		this.dispatcher_.addEventListener(type, listener);
	}

	public removeEventListener(type: CollectionEvent.Type, listener: Vector.Listener<T>): void
	{
		this.dispatcher_.removeEventListener(type, listener);
	}
}

export namespace Vector
{
	export type Event<T> = CollectionEvent<T, std.Vector<T>, std.Vector.Iterator<T>, std.Vector.ReverseIterator<T>>;
	export type Listener<T> = CollectionEvent.Listener<T, std.Vector<T>, std.Vector.Iterator<T>, std.Vector.ReverseIterator<T>>;
}